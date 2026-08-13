from __future__ import annotations

import re
from typing import Any

import pymupdf


class PDFProcessingError(Exception):
    """Raised when a PDF cannot be processed."""


def clean_page_text(text: str) -> str:
    """
    Clean extracted PDF text while preserving useful line boundaries.
    """

    text = text.replace("\x00", "")

    cleaned_lines: list[str] = []

    for line in text.splitlines():
        cleaned_line = re.sub(r"[ \t]+", " ", line).strip()

        if cleaned_line:
            cleaned_lines.append(cleaned_line)

    return "\n".join(cleaned_lines)


def find_chunk_end(
    text: str,
    start: int,
    preferred_end: int,
) -> int:
    """
    Try to end a chunk at a paragraph, sentence, or word boundary.
    """

    if preferred_end >= len(text):
        return len(text)

    minimum_boundary = start + int((preferred_end - start) * 0.7)

    boundary_options = [
        text.rfind("\n", minimum_boundary, preferred_end),
        text.rfind(". ", minimum_boundary, preferred_end),
        text.rfind("? ", minimum_boundary, preferred_end),
        text.rfind("! ", minimum_boundary, preferred_end),
        text.rfind(" ", minimum_boundary, preferred_end),
    ]

    valid_boundaries = [
        boundary for boundary in boundary_options if boundary > start
    ]

    if not valid_boundaries:
        return preferred_end

    selected_boundary = max(valid_boundaries)

    # Include punctuation when the boundary is a sentence ending.
    if text[selected_boundary : selected_boundary + 2] in {
        ". ",
        "? ",
        "! ",
    }:
        return selected_boundary + 1

    return selected_boundary


def chunk_page_text(
    text: str,
    page_number: int,
    chunk_size: int = 1200,
    chunk_overlap: int = 200,
) -> list[dict[str, Any]]:
    """
    Split one page into overlapping chunks.

    Every chunk retains its original page number so that citations can
    later point back to the correct PDF page.
    """

    if not text.strip():
        return []

    if chunk_overlap >= chunk_size:
        raise ValueError("chunk_overlap must be smaller than chunk_size")

    chunks: list[dict[str, Any]] = []
    start = 0
    chunk_index = 0

    while start < len(text):
        preferred_end = min(start + chunk_size, len(text))
        end = find_chunk_end(text, start, preferred_end)

        chunk_text = text[start:end].strip()

        if chunk_text:
            chunks.append(
                {
                    "page_number": page_number,
                    "chunk_index": chunk_index,
                    "text": chunk_text,
                    "character_count": len(chunk_text),
                }
            )

            chunk_index += 1

        if end >= len(text):
            break

        next_start = max(0, end - chunk_overlap)

        # Prevent a malformed boundary from causing an infinite loop.
        if next_start <= start:
            next_start = end

        start = next_start

    return chunks


def extract_pdf(
    pdf_bytes: bytes,
    filename: str,
    chunk_size: int = 1200,
    chunk_overlap: int = 200,
) -> dict[str, Any]:
    """
    Extract text and citation metadata from a PDF byte stream.
    """

    if not pdf_bytes:
        raise PDFProcessingError("The uploaded PDF is empty.")

    try:
        document = pymupdf.open(
            stream=pdf_bytes,
            filetype="pdf",
        )
    except Exception as exc:
        raise PDFProcessingError(
            "The uploaded file could not be opened as a PDF."
        ) from exc

    try:
        if document.page_count == 0:
            raise PDFProcessingError("The PDF does not contain any pages.")

        pages: list[dict[str, Any]] = []
        all_chunks: list[dict[str, Any]] = []
        pages_without_text: list[int] = []
        total_characters = 0

        for page_index in range(document.page_count):
            page = document.load_page(page_index)
            page_number = page_index + 1

            raw_text = page.get_text(
                "text",
                sort=True,
            )

            cleaned_text = clean_page_text(raw_text)

            if not cleaned_text:
                pages_without_text.append(page_number)

            page_chunks = chunk_page_text(
                text=cleaned_text,
                page_number=page_number,
                chunk_size=chunk_size,
                chunk_overlap=chunk_overlap,
            )

            pages.append(
                {
                    "page_number": page_number,
                    "character_count": len(cleaned_text),
                    "chunk_count": len(page_chunks),
                    "has_text": bool(cleaned_text),
                }
            )

            total_characters += len(cleaned_text)
            all_chunks.extend(page_chunks)

        return {
            "filename": filename,
            "page_count": document.page_count,
            "total_characters": total_characters,
            "chunk_count": len(all_chunks),
            "pages_without_text": pages_without_text,
            "pages": pages,
            "chunks": all_chunks,
        }

    finally:
        document.close()