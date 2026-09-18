from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from infrastructure.models import Base, TenantModel
from infrastructure.document_repository import DocumentRepository
from infrastructure.agent_run_repository import AgentRunRepository
from infrastructure.assessment_item_repository import AssessmentItemRepository

from domain.document import Document
from domain.agent_run import AgentRun
from domain.assessment_item import AssessmentItem


def make_session():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)

    SessionLocal = sessionmaker(bind=engine)
    return SessionLocal()


def test_documents_are_isolated_between_tenants():
    session = make_session()
    repository = DocumentRepository(session)

    session.add_all(
        [
            TenantModel(id="tenant-a", name="Tenant A"),
            TenantModel(id="tenant-b", name="Tenant B"),
        ]
    )
    session.commit()

    document_a = Document(
        id="doc-a",
        title="Tenant A Document",
        tenant_id="tenant-a",
        specialization="Computer Science",
    )

    document_b = Document(
        id="doc-b",
        title="Tenant B Document",
        tenant_id="tenant-b",
        specialization="Mathematics",
    )

    repository.add_document(document_a)
    repository.add_document(document_b)

    # Tenant A can access its own document.
    assert repository.get_by_id("doc-a", "tenant-a") is not None

    # Tenant A cannot access Tenant B's document.
    assert repository.get_by_id("doc-b", "tenant-a") is None

    # Tenant B cannot access Tenant A's document.
    assert repository.get_by_id("doc-a", "tenant-b") is None


def test_document_status_cannot_be_changed_across_tenants():
    session = make_session()
    repository = DocumentRepository(session)

    session.add_all(
        [
            TenantModel(id="tenant-a", name="Tenant A"),
            TenantModel(id="tenant-b", name="Tenant B"),
        ]
    )
    session.commit()

    document_b = Document(
        id="doc-b",
        title="Tenant B Document",
        tenant_id="tenant-b",
        specialization="Mathematics",
        status="uploaded",
    )

    repository.add_document(document_b)

    # Tenant A tries to change Tenant B's document.
    repository.update_status(
        document_id="doc-b",
        tenant_id="tenant-a",
        status="processed",
    )

    # The document must remain unchanged.
    document = repository.get_by_id("doc-b", "tenant-b")

    assert document is not None
    assert document.status == "uploaded"


def test_agent_runs_are_isolated_between_tenants():
    session = make_session()
    repository = AgentRunRepository(session)

    session.add_all(
        [
            TenantModel(id="tenant-a", name="Tenant A"),
            TenantModel(id="tenant-b", name="Tenant B"),
        ]
    )
    session.commit()

    run_b = AgentRun(
        id="run-b",
        tenant_id="tenant-b",
        learning_goal="Tenant B goal",
    )

    repository.add(run_b)

    # Tenant A cannot access Tenant B's run.
    assert repository.get_by_id("run-b", "tenant-a") is None

    # Tenant A cannot change Tenant B's run.
    repository.update_status(
        run_id="run-b",
        tenant_id="tenant-a",
        status="completed",
    )

    run = repository.get_by_id("run-b", "tenant-b")

    assert run is not None
    assert run.status == "running"


def test_assessment_items_are_isolated_between_tenants():
    session = make_session()
    repository = AssessmentItemRepository(session)

    session.add_all(
        [
            TenantModel(id="tenant-a", name="Tenant A"),
            TenantModel(id="tenant-b", name="Tenant B"),
        ]
    )
    session.commit()

    run_b = AgentRun(
        id="run-b",
        tenant_id="tenant-b",
        learning_goal="Tenant B goal",
    )

    AgentRunRepository(session).add(run_b)

    item_b = AssessmentItem(
        id="item-b",
        tenant_id="tenant-b",
        run_id="run-b",
        module_title="Module B",
        question="Question B",
        answer_key="Answer B",
        standard="STD-B",
        document_title="Document B",
        page_number=1,
    )

    repository.add_many([item_b])

    # Tenant A cannot access Tenant B's item.
    assert repository.get_by_id("item-b", "tenant-a") is None

    # Tenant A cannot get Tenant B's pending items.
    assert repository.get_pending_by_tenant("tenant-a") == []

    # Tenant A cannot review Tenant B's item.
    result = repository.update_review(
        item_id="item-b",
        tenant_id="tenant-a",
        status="approved",
        reviewed_by="user-a",
        review_comment="Unauthorized attempt",
    )

    assert result is None

    # Tenant B's item remains pending.
    item = repository.get_by_id("item-b", "tenant-b")

    assert item is not None
    assert item.status == "pending_approval"
    assert item.reviewed_by is None