import os
from domain.document import Document


class UploadDocumentUseCase:
    def __init__(self, document_repository):
        self.document_repository = document_repository

    def execute(self, file, tenant_id: str):
        new_doc = Document(
            title=file.filename,
            tenant_id=tenant_id,
            specialization="general",
            status="uploaded"
        )

        os.makedirs("uploads", exist_ok=True)
        save_path = f"uploads/{new_doc.id}_{file.filename}"

        with open(save_path, "wb") as f:
            f.write(file.file.read())

        self.document_repository.add_document(new_doc)

        return new_doc, save_path, file.content_type