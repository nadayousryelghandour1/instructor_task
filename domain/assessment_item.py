from dataclasses import dataclass, field
from uuid import uuid4


@dataclass
class AssessmentItem:
    tenant_id: str
    run_id: str
    module_title: str
    question: str
    answer_key: str
    standard: str
    document_title: str
    page_number: int
    status: str = "pending_approval"  # pending_approval | approved | rejected
    reviewed_by: str | None = None
    review_comment: str | None = None
    id: str = field(default_factory=lambda: str(uuid4()))
