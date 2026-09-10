from infrastructure.text_extraction.pypdf_extractor import extract_pages_from_pdf

class FileReader:

    def read(self, file_path: str, content_type: str):
        if content_type == "application/pdf":
            return extract_pages_from_pdf(file_path)

        raise ValueError("Unsupported file type")