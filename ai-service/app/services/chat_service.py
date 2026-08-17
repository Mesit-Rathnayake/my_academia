from __future__ import annotations

import os
from typing import Any

from google import genai
from tenacity import retry, stop_after_attempt, wait_exponential

from app.services.vector_store_service import (
    search_document_chunks,
)


GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

GEMINI_MODEL_NAME = os.getenv(
    "GEMINI_MODEL_NAME",
    "gemini-3.5-flash",
)


class ChatServiceError(Exception):
    """Raised when chat generation fails."""


SYSTEM_PROMPT = """\
You are **My Academia AI** — a helpful academic assistant.

RULES:
1. Answer the student's question using ONLY the provided context chunks.
2. If the context does not contain enough information, say so honestly.
3. Cite your sources using the format **[Source: <document_name> — Page <page_number>]** \
immediately after any claim that comes from a specific chunk.
4. Keep answers clear, well-structured, and concise.
5. Use markdown formatting (headings, bullet points, bold) to improve readability.
6. Do NOT invent information beyond the provided context.
7. If the user asks for a quiz or test, output the quiz exactly in a JSON array format enclosed within a ```quiz ... ``` markdown block. Do not wrap the quiz in anything other than the quiz block. Each question must have: 'question' (string), 'options' (array of strings), 'answer' (integer index of correct option), and 'explanation' (string).
"""


def _build_context_block(
    chunks: list[dict[str, Any]],
) -> str:
    """
    Format retrieved chunks into a numbered context block
    that is injected into the prompt.
    """

    if not chunks:
        return "No relevant documents were found."

    sections: list[str] = []

    for index, chunk in enumerate(chunks, start=1):
        sections.append(
            f"--- Chunk {index} ---\n"
            f"Document: {chunk['document_name']}\n"
            f"Page: {chunk['page_number']}\n"
            f"Similarity: {chunk['similarity']}\n"
            f"Content:\n{chunk['text']}\n"
        )

    return "\n".join(sections)


def _build_messages(
    question: str,
    context_block: str,
    conversation_history: list[dict[str, str]] | None = None,
) -> list[dict[str, Any]]:
    """
    Build the message list for the Gemini API.

    Includes optional conversation history so that
    multi-turn follow-up questions work naturally.
    """

    messages: list[dict[str, Any]] = []

    # Replay prior turns so the model has conversational context.
    if conversation_history:
        for entry in conversation_history:
            role = entry.get("role", "user")
            messages.append(
                {
                    "role": role,
                    "parts": [
                        {"text": entry["content"]},
                    ],
                }
            )

    # Current turn: inject the retrieved context + question.
    user_prompt = (
        f"### Retrieved Context\n\n"
        f"{context_block}\n\n"
        f"### Student Question\n\n"
        f"{question}"
    )

    messages.append(
        {
            "role": "user",
            "parts": [
                {"text": user_prompt},
            ],
        }
    )

    return messages


@retry(
    stop=stop_after_attempt(5),
    wait=wait_exponential(multiplier=1, min=2, max=10),
    reraise=True
)
def _call_gemini_with_retry(client, model, messages, config):
    """
    Calls Gemini API with exponential backoff retries to handle 503 UNAVAILABLE errors.
    """
    return client.models.generate_content(
        model=model,
        contents=messages,
        config=config,
    )


@retry(
    stop=stop_after_attempt(5),
    wait=wait_exponential(multiplier=1, min=2, max=10),
    reraise=True
)
def _call_gemini_with_retry(client, model, messages, config):
    """
    Calls Gemini API with exponential backoff retries to handle 503 UNAVAILABLE errors.
    """
    return client.models.generate_content(
        model=model,
        contents=messages,
        config=config,
    )


def chat(
    *,
    user_id: str,
    module_id: str,
    question: str,
    document_ids: list[str] | None = None,
    top_k: int = 5,
    conversation_history: list[dict[str, str]] | None = None,
) -> dict[str, Any]:
    """
    End-to-end RAG chat: retrieve → augment → generate.

    Returns the generated answer together with the source chunks
    so the frontend can display citations.
    """

    if not GEMINI_API_KEY:
        raise ChatServiceError(
            "GEMINI_API_KEY is not configured. "
            "Set it in the .env file."
        )

    # --- Retrieve ---
    retrieved_chunks = search_document_chunks(
        user_id=user_id,
        module_id=module_id,
        question=question,
        top_k=top_k,
        document_ids=document_ids,
    )

    # --- Augment ---
    context_block = _build_context_block(retrieved_chunks)
    messages = _build_messages(
        question=question,
        context_block=context_block,
        conversation_history=conversation_history,
    )

    # --- Generate ---
    try:
        client = genai.Client(api_key=GEMINI_API_KEY)

        response = _call_gemini_with_retry(
            client=client,
            model=GEMINI_MODEL_NAME,
            messages=messages,
            config={
                "system_instruction": SYSTEM_PROMPT,
                "temperature": 0.3,
                "max_output_tokens": 8192,
            },
        )

        answer = response.text or "I could not generate a response."

    except Exception as exc:
        raise ChatServiceError(
            f"Gemini API call failed: {exc}"
        ) from exc

    # --- Build source list for the frontend ---
    sources = [
        {
            "document_name": chunk["document_name"],
            "page_number": chunk["page_number"],
            "similarity": chunk["similarity"],
            "text_preview": chunk["text"][:200],
        }
        for chunk in retrieved_chunks
    ]

    return {
        "answer": answer,
        "sources": sources,
    }
