"""
Tool: get_document_metadata

A read-only tool. Given a document_id (and the tenant it must belong
to), returns the document's metadata (title, status, etc). Used by
agents/use cases that need a human-readable document title for
citations rather than a raw ID.
"""


class GetDocumentMetadataTool:
    name = "get_document_metadata"
    description = "Look up a document's metadata (title, status) by ID, scoped to a tenant."
    is_write_tool = False

    def __init__(self, document_repository):
        self._document_repository = document_repository

    def run(self, tenant_id: str, document_id: str):
        return self._document_repository.get_by_id(
            document_id=document_id,
            tenant_id=tenant_id,
        )