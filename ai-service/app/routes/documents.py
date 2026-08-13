from pathlib import Path

from fastapi import (
    APIRouter,
    File,
    Form,
    HTTPException,
    UploadFile,
)
from pydantic import BaseModel, Field

from app.services.embedding_service import EmbeddingError
from app.services.pdf_service import (
    PDFProcessingError,
    extract_pdf,
)
from app.services.vector_store_service import (
    VectorStoreError,
    index_document_chunks,
)


router = APIRouter(
    prefix="/documents",
    tags=["Documents"],
)

MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024
MAX_PREVIEW_CHUNKS = 5


class PageSummary(BaseModel):
    page_number: int
    character_count: int
    chunk_count: int
    has_text: bool


class ChunkPreview(BaseModel):
    page_number: int
    chunk_index: int
    character_count: int
    text: str


class DocumentExtractionResponse(BaseModel):
    filename: str
    page_count: int
    total_characters: int
    chunk_count: int
    pages_without_text: list[int]
    pages: list[PageSummary]
    preview_chunks: list[ChunkPreview] = Field(
        description="A limited preview of the generated chunks."
    )


class DocumentIndexResponse(BaseModel):
    message: str
    user_id: str
    module_id: str
    document_id: str
    document_name: str
    page_count: int
    indexed_chunks: int
    pages_without_text: list[int]
    collection_name: str


async def read_and_validate_pdf(
    file: UploadFile,
) -> tuple[str, bytes]:
    """
    Validate an uploaded PDF and return its filename and content.
    """

    filename = file.filename or "uploaded-document.pdf"

    if Path(filename).suffix.lower() != ".pdf":
        raise HTTPException(
            status_code=400,
            detail="Only PDF documents are supported.",
        )

    pdf_bytes = await file.read()

    if not pdf_bytes:
        raise HTTPException(
            status_code=400,
            detail="The uploaded PDF is empty.",
        )

    if len(pdf_bytes) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=413,
            detail="The PDF exceeds the 25 MB upload limit.",
        )

    return filename, pdf_bytes


@router.post(
    "/extract",
    response_model=DocumentExtractionResponse,
)
async def extract_document(
    file: UploadFile = File(...),
) -> DocumentExtractionResponse:
    """
    Extract page-aware chunks without storing embeddings.
    """

    try:
        filename, pdf_bytes = await read_and_validate_pdf(
            file
        )

        result = extract_pdf(
            pdf_bytes=pdf_bytes,
            filename=filename,
        )

        return DocumentExtractionResponse(
            filename=result["filename"],
            page_count=result["page_count"],
            total_characters=result["total_characters"],
            chunk_count=result["chunk_count"],
            pages_without_text=result["pages_without_text"],
            pages=result["pages"],
            preview_chunks=result["chunks"][
                :MAX_PREVIEW_CHUNKS
            ],
        )

    except PDFProcessingError as exc:
        raise HTTPException(
            status_code=422,
            detail=str(exc),
        ) from exc
    finally:
        await file.close()


@router.post(
    "/index",
    response_model=DocumentIndexResponse,
)
async def index_document(
    user_id: str = Form(...),
    module_id: str = Form(...),
    document_id: str = Form(...),
    file: UploadFile = File(...),
) -> DocumentIndexResponse:
    """
    Extract, embed and store one PDF in Chroma.
    """

    user_id = user_id.strip()
    module_id = module_id.strip()
    document_id = document_id.strip()

    if not user_id:
        raise HTTPException(
            status_code=400,
            detail="user_id cannot be empty.",
        )

    if not module_id:
        raise HTTPException(
            status_code=400,
            detail="module_id cannot be empty.",
        )

    if not document_id:
        raise HTTPException(
            status_code=400,
            detail="document_id cannot be empty.",
        )

    try:
        filename, pdf_bytes = await read_and_validate_pdf(
            file
        )

        extraction_result = extract_pdf(
            pdf_bytes=pdf_bytes,
            filename=filename,
        )

        if not extraction_result["chunks"]:
            raise HTTPException(
                status_code=422,
                detail=(
                    "No searchable text was found in the PDF. "
                    "The document may require OCR."
                ),
            )

        indexing_result = index_document_chunks(
            user_id=user_id,
            module_id=module_id,
            document_id=document_id,
            document_name=filename,
            chunks=extraction_result["chunks"],
        )

        return DocumentIndexResponse(
            message="Document indexed successfully.",
            user_id=user_id,
            module_id=module_id,
            document_id=document_id,
            document_name=filename,
            page_count=extraction_result["page_count"],
            indexed_chunks=indexing_result[
                "indexed_chunks"
            ],
            pages_without_text=extraction_result[
                "pages_without_text"
            ],
            collection_name=indexing_result[
                "collection_name"
            ],
        )

    except HTTPException:
        raise
    except PDFProcessingError as exc:
        raise HTTPException(
            status_code=422,
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
    finally:
        await file.close()