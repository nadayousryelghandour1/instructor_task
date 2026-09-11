from fastapi import APIRouter, Depends

from application.answer_question_use_case import AnswerQuestionUseCase
from api.dependencies import get_answer_question_use_case , get_current_user

router = APIRouter()


@router.post("/chat")
def chat(
    question: str,
    current_user: dict = Depends(get_current_user),
    answer_question_use_case: AnswerQuestionUseCase = Depends(
        get_answer_question_use_case
    ),
):
    tenant_id = current_user["tenant_id"]

    return answer_question_use_case.execute(
        tenant_id=tenant_id,
        question=question,
    )