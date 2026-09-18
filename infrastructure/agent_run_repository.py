import json

from sqlalchemy.orm import Session

from infrastructure.models import AgentRunModel
from domain.agent_run import AgentRun, AgentStep


class AgentRunRepository:
    def __init__(self, session: Session):
        self.session = session

    def add(self, run: AgentRun) -> None:
        model = AgentRunModel(
            id=run.id,
            tenant_id=run.tenant_id,
            learning_goal=run.learning_goal,
            status=run.status,
            steps_json=json.dumps([step.__dict__ for step in run.steps]),
            created_at=run.created_at,
        )

        self.session.add(model)
        self.session.commit()

    def update_status(self, run_id: str, tenant_id: str, status: str) -> None:
        model = (
            self.session.query(AgentRunModel)
            .filter(
                AgentRunModel.id == run_id,
                AgentRunModel.tenant_id == tenant_id,
            )
            .first()
        )

        if model is None:
            return

        model.status = status
        self.session.commit()

    def get_by_id(self, run_id: str, tenant_id: str) -> AgentRun | None:
        model = (
            self.session.query(AgentRunModel)
            .filter(
                AgentRunModel.id == run_id,
                AgentRunModel.tenant_id == tenant_id,
            )
            .first()
        )

        if model is None:
            return None

        return AgentRun(
            id=model.id,
            tenant_id=model.tenant_id,
            learning_goal=model.learning_goal,
            status=model.status,
            steps=[AgentStep(**s) for s in json.loads(model.steps_json)],
            created_at=model.created_at,
        )
