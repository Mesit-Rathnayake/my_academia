from __future__ import annotations

import os
from functools import lru_cache
from typing import Any, cast

from sentence_transformers import SentenceTransformer


EMBEDDING_MODEL_NAME = os.getenv(
    "EMBEDDING_MODEL_NAME",
    "sentence-transformers/all-MiniLM-L6-v2",
)


class EmbeddingError(Exception):
    """Raised when text embeddings cannot be generated."""


@lru_cache(maxsize=1)
def get_embedding_model() -> SentenceTransformer:
    """
    Load the embedding model once and reuse it for later requests.
    """

    try:
        return SentenceTransformer(EMBEDDING_MODEL_NAME)
    except Exception as exc:
        raise EmbeddingError(
            f"Could not load embedding model: {EMBEDDING_MODEL_NAME}"
        ) from exc


def embed_documents(texts: list[str]) -> list[list[float]]:
    """
    Generate embeddings for document chunks.
    """

    if not texts:
        return []

    cleaned_texts = [text.strip() for text in texts]

    if any(not text for text in cleaned_texts):
        raise EmbeddingError(
            "Document chunks cannot contain empty text."
        )

    model = get_embedding_model()

    try:
        embeddings: Any = model.encode(
            cleaned_texts,
            normalize_embeddings=True,
            convert_to_numpy=True,
            show_progress_bar=False,
        )
    except Exception as exc:
        raise EmbeddingError(
            "Could not generate document embeddings."
        ) from exc

    return cast(list[list[float]], embeddings.tolist())


def embed_query(question: str) -> list[float]:
    """
    Generate an embedding for a user's search question.
    """

    cleaned_question = question.strip()

    if not cleaned_question:
        raise EmbeddingError(
            "The search question cannot be empty."
        )

    model = get_embedding_model()

    try:
        embedding: Any = model.encode(
            cleaned_question,
            normalize_embeddings=True,
            convert_to_numpy=True,
            show_progress_bar=False,
        )
    except Exception as exc:
        raise EmbeddingError(
            "Could not generate the question embedding."
        ) from exc

    return cast(list[float], embedding.tolist())