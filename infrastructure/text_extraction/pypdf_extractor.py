from pypdf import PdfReader

def extract_pages_from_pdf(file_path: str) -> list[dict]:
    reader = PdfReader(file_path)         
    pages_data = []                         

    for index, page in enumerate(reader.pages):  
        pages_data.append({                        
            "page_number": index + 1,
            "text": page.extract_text()
        })

    return pages_data