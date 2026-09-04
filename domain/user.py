from dataclasses import dataclass


@dataclass
class User:
    id: str
    name: str
    tenant_id: str
    role: str