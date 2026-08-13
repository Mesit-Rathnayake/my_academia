from __future__ import annotations

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field, field_validator


from app.services.chat_service import (
    ChatServiceError,
    chat,
)
from app.services.embedding_service import EmbeddingError
from app.services.vector_store_service import VectorStoreError


router = APIRouter(
    prefix="/chat",
    tags=["Chat"],
)


# ── Request / Response models ──────────────────────────────


class ConversationMessage(BaseModel):
    role: str = Field(
        pattern="^(user|model)$",
        description="Either 'user' or 'model'.",
    )
    content: str = Field(min_length=1)


class ChatRequest(BaseModel):
    user_id: str = Field(
        min_length=1,
        max_length=200,
    )

    module_id: str = Field(
        min_length=1,
        max_length=200,
    )

    question: str = Field(
        min_length=1,
        max_length=2000,
    )

    document_id: str | None = Field(
        default=None,
        max_length=200,
    )

    top_k: int = Field(
        default=5,
        ge=1,
        le=10,
    )

    conversation_history: list[ConversationMessage] = Field(
        default_factory=list,
        max_length=20,
        description=(
            "Previous messages for multi-turn context. "
            "Oldest first."
        ),
    )

    @field_validator(
        "user_id",
        "module_id",
        "question",
        "document_id",
        mode="before",
    )
    @classmethod
    def strip_string_values(
        cls,
        value: str | None,
    ) -> str | None:
        if isinstance(value, str):
            return value.strip()
        return value


class SourceReference(BaseModel):
    document_name: str
    page_number: int
    similarity: float
    text_preview: str


class ChatResponse(BaseModel):
    answer: str
    sources: list[SourceReference]


# ── Endpoint ────────────────────────────────────────────────


@router.post(
    "",
    response_model=ChatResponse,
)
def chat_with_documents(
    request: ChatRequest,
) -> ChatResponse:
    """
    Ask a question about your uploaded documents.

    The service retrieves relevant document chunks,
    then uses Google Gemini to generate a cited answer.
    """

    try:
        history = [
            {
                "role": msg.role,
                "content": msg.content,
            }
            for msg in request.conversation_history
        ]

        result = chat(
            user_id=request.user_id,
            module_id=request.module_id,
            question=request.question,
            document_id=request.document_id,
            top_k=request.top_k,
            conversation_history=history or None,
        )

        return ChatResponse(
            answer=result["answer"],
            sources=result["sources"],
        )

    except ChatServiceError as exc:
        raise HTTPException(
            status_code=502,
            detail=str(exc),
        ) from exc
    except EmbeddingError as exc:
        raise HTTPException(
            status_code=500,
            detail=str(exc),
        ) from exc
    except VectorStoreError as exc:
        raise HTTPException(
            status_code=500,
            detail=str(exc),
        ) from exc
