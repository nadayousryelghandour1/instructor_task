from dataclasses import dataclass


@dataclass
class Document:
    id: str
    title: str
    tenant_id: str
    specialization: str
    status: str