
class GetDocument:
    def __init__(self, document_repository):
        self.repository = document_repository

    def execute(self, document_id, tenant_id):
        return self.repository.get_by_id(document_id, tenant_id)