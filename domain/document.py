from dataclasses import dataclass, field
from uuid import uuid4


@dataclass
class Document:
    title: str
    tenant_id: str
    specialization: str
    status: str = "pending"
    id: str = field(default_factory=lambda: str(uuid4()))
