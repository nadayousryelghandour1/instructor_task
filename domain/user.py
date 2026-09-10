from dataclasses import dataclass , field
from uuid import uuid4


@dataclass
class User:
    name: str
    tenant_id: str
    role: str
    id: str = field(default_factory=lambda : str(uuid4()))
