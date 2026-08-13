from __future__ import annotations

import hashlib
import os
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import chromadb

from app.services.embedding_service import (
    embed_documents,
    embed_query,
)


COLLECTION_NAME = os.getenv(
    "CHROMA_COLLECTION_NAME",
    "my_academia_documents",
)

DEFAULT_CHROMA_PATH = (
    Path(__file__).resolve().parents[2] / "chroma_data"
)

CHROMA_PATH = Path(
    os.getenv(
        "CHROMA_PATH",
        str(DEFAULT_CHROMA_PATH),
    )
)


class VectorStoreError(Exception):
    """Raised when Chroma indexing or retrieval fails."""


def get_collection():
    """
    Get the persistent Chroma collection used by My Academia.
    """

    CHROMA_PATH.mkdir(
        parents=True,
        exist_ok=True,
    )

    try:
        client = chromadb.PersistentClient(
            path=str(CHROMA_PATH),
        )

        return client.get_or_create_collection(
            name=COLLECTION_NAME,
            configuration={
                "hnsw": {
                    "space": "cosine",
                }
            },
        )
    except Exception as exc:
        raise VectorStoreError(
            "Could not initialize the Chroma vector database."
        ) from exc


def build_where_filter(
    user_id: str,
    module_id: str,
    document_id: str | None = None,
) -> dict[str, Any]:
    """
    Build a secure metadata filter.

    A user can only retrieve chunks belonging to their user and module.
    """

    conditions: list[dict[str, Any]] = [
        {
            "user_id": {
                "$eq": user_id,
            }
        },
        {
            "module_id": {
                "$eq": module_id,
            }
        },
    ]

    if document_id:
        conditions.append(
            {
                "document_id": {
                    "$eq": document_id,
                }
            }
        )

    return {
        "$and": conditions,
    }


def create_chunk_id(
    user_id: str,
    module_id: str,
    document_id: str,
    page_number: int,
    chunk_index: int,
) -> str:
    """
    Create a stable unique ID for a document chunk.
    """

    raw_id = (
        f"{user_id}:"
        f"{module_id}:"
        f"{document_id}:"
        f"{page_number}:"
        f"{chunk_index}"
    )

    return hashlib.sha256(
        raw_id.encode("utf-8")
    ).hexdigest()


def index_document_chunks(
    *,
    user_id: str,
    module_id: str,
    document_id: str,
    document_name: str,
    chunks: list[dict[str, Any]],
) -> dict[str, Any]:
    """
    Embed and store all chunks belonging to one document.

    Any previously indexed chunks for the same document are removed first.
    """

    if not chunks:
        raise VectorStoreError(
            "The document does not contain indexable text."
        )

    collection = get_collection()

    where_filter = build_where_filter(
        user_id=user_id,
        module_id=module_id,
        document_id=document_id,
    )

    try:
        # Remove old chunks before reindexing the same document.
        collection.delete(
            where=where_filter,
        )

        documents = [
            chunk["text"]
            for chunk in chunks
        ]

        embeddings = embed_documents(documents)

        indexed_at = datetime.now(
            timezone.utc
        ).isoformat()

        ids: list[str] = []
        metadatas: list[dict[str, Any]] = []

        for chunk in chunks:
            page_number = int(
                chunk["page_number"]
            )

            chunk_index = int(
                chunk["chunk_index"]
            )

            ids.append(
                create_chunk_id(
                    user_id=user_id,
                    module_id=module_id,
                    document_id=document_id,
                    page_number=page_number,
                    chunk_index=chunk_index,
                )
            )

            metadatas.append(
                {
                    "user_id": user_id,
                    "module_id": module_id,
                    "document_id": document_id,
                    "document_name": document_name,
                    "page_number": page_number,
                    "chunk_index": chunk_index,
                    "indexed_at": indexed_at,
                }
            )

        batch_size = 64

        for start in range(
            0,
            len(ids),
            batch_size,
        ):
            end = start + batch_size

            collection.upsert(
                ids=ids[start:end],
                documents=documents[start:end],
                embeddings=embeddings[start:end],
                metadatas=metadatas[start:end],
            )

        return {
            "document_id": document_id,
            "document_name": document_name,
            "indexed_chunks": len(ids),
            "collection_name": COLLECTION_NAME,
        }

    except VectorStoreError:
        raise
    except Exception as exc:
        raise VectorStoreError(
            "The document could not be indexed."
        ) from exc


def search_document_chunks(
    *,
    user_id: str,
    module_id: str,
    question: str,
    top_k: int = 5,
    document_id: str | None = None,
) -> list[dict[str, Any]]:
    """
    Retrieve the most relevant chunks for a question.
    """

    collection = get_collection()

    where_filter = build_where_filter(
        user_id=user_id,
        module_id=module_id,
        document_id=document_id,
    )

    question_embedding = embed_query(question)

    try:
        query_result = collection.query(
            query_embeddings=[
                question_embedding
            ],
            n_results=top_k,
            where=where_filter,
            include=[
                "documents",
                "metadatas",
                "distances",
            ],
        )
    except Exception as exc:
        raise VectorStoreError(
            "The document collection could not be searched."
        ) from exc

    documents = (
        query_result.get("documents") or [[]]
    )[0]

    metadatas = (
        query_result.get("metadatas") or [[]]
    )[0]

    distances = (
        query_result.get("distances") or [[]]
    )[0]

    result_ids = (
        query_result.get("ids") or [[]]
    )[0]

    search_results: list[dict[str, Any]] = []

    for result_id, text, metadata, distance in zip(
        result_ids,
        documents,
        metadatas,
        distances,
    ):
        cosine_similarity = 1.0 - float(distance)

        search_results.append(
            {
                "chunk_id": result_id,
                "text": text,
                "document_id": metadata["document_id"],
                "document_name": metadata["document_name"],
                "page_number": metadata["page_number"],
                "chunk_index": metadata["chunk_index"],
                "similarity": round(
                    cosine_similarity,
                    4,
                ),
                "citation": (
                    f'{metadata["document_name"]} '
                    f'— Page {metadata["page_number"]}'
                ),
            }
        )

    return search_results