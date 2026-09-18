from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from application.agents.orchestrator import CurriculumWorkflowOrchestrator
from application.approve_item_use_case import ApproveAssessmentItemUseCase
from infrastructure.agent_run_repository import AgentRunRepository
from infrastructure.assessment_item_repository import AssessmentItemRepository
from api.dependencies import (
    get_current_user,
    get_orchestrator,
    get_approve_item_use_case,
    get_agent_run_repository,
    get_assessment_item_repository,
)

router = APIRouter(prefix="/workflow", tags=["workflow"])


class RunWorkflowRequest(BaseModel):
    learning_goal: str


class ReviewItemRequest(BaseModel):
    decision: str  # "approve" | "reject" | "edit_and_approve"
    comment: str | None = None
    edited_question: str | None = None
    edited_answer_key: str | None = None


@router.post("/runs")
def run_workflow(
    body: RunWorkflowRequest,
    current_user: dict = Depends(get_current_user),
    orchestrator: CurriculumWorkflowOrchestrator = Depends(get_orchestrator),
):
    tenant_id = current_user["tenant_id"]

    agent_run = orchestrator.run(
        tenant_id=tenant_id,
        learning_goal=body.learning_goal,
    )

    return {
        "run_id": agent_run.id,
        "status": agent_run.status,
        "steps": [step.__dict__ for step in agent_run.steps],
    }


@router.get("/runs/{run_id}")
def get_workflow_run(
    run_id: str,
    current_user: dict = Depends(get_current_user),
    agent_run_repository: AgentRunRepository = Depends(get_agent_run_repository),
    assessment_item_repository: AssessmentItemRepository = Depends(
        get_assessment_item_repository
    ),
):
    tenant_id = current_user["tenant_id"]

    agent_run = agent_run_repository.get_by_id(
        run_id=run_id,
        tenant_id=tenant_id,
    )

    if agent_run is None:
        raise HTTPException(status_code=404, detail="Run not found")

    items = assessment_item_repository.get_by_run_id(
        run_id=run_id,
        tenant_id=tenant_id,
    )

    return {
        "run_id": agent_run.id,
        "status": agent_run.status,
        "learning_goal": agent_run.learning_goal,
        "steps": [step.__dict__ for step in agent_run.steps],
        "items": [item.__dict__ for item in items],
    }


@router.get("/items/pending")
def list_pending_items(
    current_user: dict = Depends(get_current_user),
    assessment_item_repository: AssessmentItemRepository = Depends(
        get_assessment_item_repository
    ),
):
    tenant_id = current_user["tenant_id"]

    items = assessment_item_repository.get_pending_by_tenant(tenant_id=tenant_id)

    return [item.__dict__ for item in items]


@router.post("/items/{item_id}/review")
def review_item(
    item_id: str,
    body: ReviewItemRequest,
    current_user: dict = Depends(get_current_user),
    approve_item_use_case: ApproveAssessmentItemUseCase = Depends(
        get_approve_item_use_case
    ),
):
    tenant_id = current_user["tenant_id"]

    try:
        item = approve_item_use_case.execute(
            tenant_id=tenant_id,
            item_id=item_id,
            reviewer_id=current_user["sub"],
            reviewer_role=current_user["role"],
            decision=body.decision,
            comment=body.comment,
            edited_question=body.edited_question,
            edited_answer_key=body.edited_answer_key,
        )
    except PermissionError as exc:
        raise HTTPException(status_code=403, detail=str(exc))
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))

    if item is None:
        raise HTTPException(status_code=404, detail="Item not found")

    return item.__dict__
