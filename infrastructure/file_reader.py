from infrastructure.text_extraction.pypdf_extractor import extract_pages_from_pdf
from infrastructure.text_extraction.docx_extractor import extract_pages_from_docx
from infrastructure.text_extraction.pptx_extractor import extract_pages_from_pptx


class FileReader:

    def read(self, file_path: str, content_type: str):
        if content_type == "application/pdf":
            return extract_pages_from_pdf(file_path)

        if content_type == "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
            return extract_pages_from_docx(file_path)

        if content_type == "application/vnd.openxmlformats-officedocument.presentationml.presentation":
            return extract_pages_from_pptx(file_path)

        raise ValueError("Unsupported file type")