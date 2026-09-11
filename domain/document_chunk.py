from dataclasses import dataclass, field
from uuid import uuid4


@dataclass
class DocumentChunk:
    document_id: str
    tenant_id: str
    page_number: int
    text: str
    chunk_id: str =field(default_factory=lambda : str(uuid4()))

