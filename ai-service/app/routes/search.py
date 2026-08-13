from __future__ import annotations

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field, field_validator

from app.services.embedding_service import EmbeddingError
from app.services.vector_store_service import (
    VectorStoreError,
    search_document_chunks,
)


router = APIRouter(
    prefix="/search",
    tags=["Search"],
)


class SemanticSearchRequest(BaseModel):
    user_id: str = Field(
        min_length=1,
        max_length=200,
    )

    module_id: str = Field(
        min_length=1,
        max_length=200,
    )

    question: str = Field(
        min_length=3,
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


class SearchResult(BaseModel):
    chunk_id: str
    text: str
    document_id: str
    document_name: str
    page_number: int
    chunk_index: int
    similarity: float
    citation: str


class SemanticSearchResponse(BaseModel):
    question: str
    result_count: int
    results: list[SearchResult]


@router.post(
    "",
    response_model=SemanticSearchResponse,
)
def semantic_search(
    request: SemanticSearchRequest,
) -> SemanticSearchResponse:
    """
    Find document chunks relevant to an academic question.
    """

    try:
        results = search_document_chunks(
            user_id=request.user_id,
            module_id=request.module_id,
            question=request.question,
            top_k=request.top_k,
            document_id=request.document_id,
        )

        return SemanticSearchResponse(
            question=request.question,
            result_count=len(results),
            results=results,
        )

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