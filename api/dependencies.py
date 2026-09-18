from fastapi import Depends, HTTPException
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordBearer

from application.agents.standards_mapper import StandardsMapperAgent
from application.agents.curriculum_designer import CurriculumDesignerAgent
from application.agents.item_generator import ItemGeneratorAgent
from application.agents.orchestrator import CurriculumWorkflowOrchestrator
from application.approve_item_use_case import ApproveAssessmentItemUseCase
from infrastructure.agent_run_repository import AgentRunRepository
from infrastructure.assessment_item_repository import AssessmentItemRepository
from application.login_use_case import LoginUseCase
from application.register_user_use_case import RegisterUserUseCase
from infrastructure.database import SessionLocal
from infrastructure.document_repository import DocumentRepository
from infrastructure.document_chunk_repository import DocumentChunkRepository
from application.upload_document import UploadDocumentUseCase
from application.process_document import ProcessDocumentUseCase
from application.get_document import GetDocument
from infrastructure.security import verify_access_token
from infrastructure.user_repository import UserRepository
from infrastructure.tenant_repository import TenantRepository
from application.onboard_tenant_use_case import OnboardTenantUseCase
from application.search_documents_use_case import SearchDocumentsUseCase
from application.answer_question_use_case import AnswerQuestionUseCase
from application.prompt_builder import PromptBuilder
from infrastructure.llm_service import LLMService


def get_session():
    session = SessionLocal()

    try:
        yield session
    finally:
        session.close()


def get_document_repository(
    session: Session = Depends(get_session),
):
    return DocumentRepository(session)


def get_upload_use_case(
    document_repository: DocumentRepository = Depends(
        get_document_repository
    ),
):
    return UploadDocumentUseCase(document_repository)


def get_document_use_case(
    document_repository: DocumentRepository = Depends(
        get_document_repository
    ),
):
    return GetDocument(document_repository)


def get_chunk_repository(
    session: Session = Depends(get_session),
):
    return DocumentChunkRepository(session)


def get_user_repository(
    session: Session = Depends(get_session),
):
    return UserRepository(session)


def get_tenants_repository(
    session: Session = Depends(get_session),
):
    return TenantRepository(session)


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")


def get_current_user(
    token: str = Depends(oauth2_scheme),
) -> dict:
    try:
        payload = verify_access_token(token)
        return payload

    except ValueError:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token",
        )


def verify_tenant_access(
    tenant_id: str,
    current_user: dict = Depends(get_current_user),
):
    if current_user["tenant_id"] != tenant_id:
        raise HTTPException(
            status_code=403,
            detail="Access denied",
        )


def get_login_use_case(
    user_repository: UserRepository = Depends(
        get_user_repository
    ),
):
    return LoginUseCase(user_repository)


def get_register_use_case(
    user_repository: UserRepository = Depends(
        get_user_repository
    ),
):
    return RegisterUserUseCase(user_repository)


def get_onboard_use_case(
    tenant_repository: TenantRepository = Depends(
        get_tenants_repository
    ),
    user_repository: UserRepository = Depends(
        get_user_repository
    ),
):
    return OnboardTenantUseCase(
        tenant_repository,
        user_repository,
    )


def get_search_documents_use_case(
    chunk_repository: DocumentChunkRepository = Depends(
        get_chunk_repository
    ),
):
    return SearchDocumentsUseCase(chunk_repository)


def get_answer_question_use_case(
    search_documents: SearchDocumentsUseCase = Depends(
        get_search_documents_use_case
    ),
    document_repository: DocumentRepository = Depends(
        get_document_repository
    ),
):
    prompt_builder = PromptBuilder()
    llm_service = LLMService()

    return AnswerQuestionUseCase(
        search_documents=search_documents,
        prompt_builder=prompt_builder,
        llm_service=llm_service,
        document_repository=document_repository,
    )
    

def get_standards_mapper_agent(
    search_documents: SearchDocumentsUseCase = Depends(
        get_search_documents_use_case
    ),
):
    llm_service = LLMService()

    return StandardsMapperAgent(
        search_documents=search_documents,
        llm_service=llm_service,
    )


def get_curriculum_designer_agent(
    search_documents: SearchDocumentsUseCase = Depends(
        get_search_documents_use_case
    ),
):
    llm_service = LLMService()

    return CurriculumDesignerAgent(
        search_documents=search_documents,
        llm_service=llm_service,
    )


def get_item_generator_agent():
    llm_service = LLMService()

    return ItemGeneratorAgent(llm_service=llm_service)


def get_agent_run_repository(
    session: Session = Depends(get_session),
):
    return AgentRunRepository(session)


def get_assessment_item_repository(
    session: Session = Depends(get_session),
):
    return AssessmentItemRepository(session)


def get_orchestrator(
    standards_mapper: StandardsMapperAgent = Depends(
        get_standards_mapper_agent
    ),
    curriculum_designer: CurriculumDesignerAgent = Depends(
        get_curriculum_designer_agent
    ),
    item_generator: ItemGeneratorAgent = Depends(
        get_item_generator_agent
    ),
    agent_run_repository: AgentRunRepository = Depends(
        get_agent_run_repository
    ),
    assessment_item_repository: AssessmentItemRepository = Depends(
        get_assessment_item_repository
    ),
):
    return CurriculumWorkflowOrchestrator(
        standards_mapper=standards_mapper,
        curriculum_designer=curriculum_designer,
        item_generator=item_generator,
        agent_run_repository=agent_run_repository,
        assessment_item_repository=assessment_item_repository,
    )


def get_approve_item_use_case(
    assessment_item_repository: AssessmentItemRepository = Depends(
        get_assessment_item_repository
    ),
    agent_run_repository: AgentRunRepository = Depends(
        get_agent_run_repository
    ),
):
    return ApproveAssessmentItemUseCase(
        assessment_item_repository=assessment_item_repository,
        agent_run_repository=agent_run_repository,
    )