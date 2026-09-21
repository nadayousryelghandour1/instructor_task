from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Request

from application.answer_question_use_case import AnswerQuestionUseCase
from api.dependencies import (
    get_answer_question_use_case,
    get_current_user,
)

router = APIRouter()


@router.post("/chat")
async def chat(
    request: Request,
    current_user: dict = Depends(get_current_user),
    answer_question_use_case: AnswerQuestionUseCase = Depends(
        get_answer_question_use_case
    ),
):
    payload: dict[str, Any] = {}
    try:
        payload = await request.json()
    except Exception:
        payload = {}

    question = payload.get("question")
    history = payload.get("history")

    if question is None:
        question = request.query_params.get("question")
    if history is None:
        history_raw = request.query_params.get("history")
        if history_raw:
            history = [history_raw]

    if not question or not str(question).strip():
        raise HTTPException(status_code=400, detail="Question is required")

    if history is not None:
        history = [str(item) for item in history if item is not None]

    tenant_id = current_user["tenant_id"]

    return answer_question_use_case.execute(
        tenant_id=tenant_id,
        question=str(question).strip(),
        history=history,
    )