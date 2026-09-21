"""
Tool: search_corpus

A read-only tool. Given a tenant and a query, returns the most relevant
document chunks from that tenant's corpus. Wraps the existing
SearchDocumentsUseCase so agents interact with a named, restricted
"tool" rather than reaching into infrastructure directly.
"""


class SearchCorpusTool:
    name = "search_corpus"
    description = "Search the tenant's document corpus for relevant chunks."
    is_write_tool = False

    def __init__(self, search_documents_use_case):
        self._search_documents_use_case = search_documents_use_case

    def run(self, tenant_id: str, query: str, top_k: int = 5):
        """
        Returns a list of (score, chunk) tuples, same shape as the
        underlying SearchDocumentsUseCase.
        """
        return self._search_documents_use_case.execute(
            tenant_id=tenant_id,
            question=query,
            top_k=top_k,
        )