from dataclasses import dataclass, field
from datetime import datetime, timezone
from uuid import uuid4


@dataclass
class AgentStep:
    agent_name: str
    status: str  # "success" | "failed"
    input_summary: str
    output_summary: str
    started_at: str
    finished_at: str
    error: str | None = None


@dataclass
class AgentRun:
    tenant_id: str
    learning_goal: str
    status: str = "running"  # running | awaiting_approval | completed | completed_no_evidence | failed
    steps: list[AgentStep] = field(default_factory=list)
    id: str = field(default_factory=lambda: str(uuid4()))
    created_at: str = field(
        default_factory=lambda: datetime.now(timezone.utc).isoformat()
    )
