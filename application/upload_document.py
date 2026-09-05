import os
from domain.document import Document
import uuid

class UploadDocumentUseCase:
    def __init__(self, document_repository):
        self.document_repository = document_repository

    def execute(self, file, tenant_id: str):
        save_path = f"uploads/{file.filename}"
        os.makedirs("uploads", exist_ok=True)

        with open(save_path, "wb") as f:
            f.write(file.file.read())

        new_doc = Document(
            id=str(uuid.uuid4()),
            title=file.filename,
            tenant_id=tenant_id,
            specialization="general",
            status="uploaded"
        )

        self.document_repository.addDocument(new_doc)
        return new_doc