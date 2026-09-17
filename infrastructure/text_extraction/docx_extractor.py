from docx import Document as DocxDocument


def extract_pages_from_docx(file_path: str) -> list[dict]:
    doc = DocxDocument(file_path)
    full_text = "\n".join(p.text for p in doc.paragraphs if p.text.strip())

    return [{"page_number": 1, "text": full_text}]