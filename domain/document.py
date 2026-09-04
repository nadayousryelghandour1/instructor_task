from dataclasses import dataclass


@dataclass
class Document:
    id: str
    title: str
    num_of_pages: int
    tenant_id: str
    specialization: str
    status: str