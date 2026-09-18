import time

from application.agents.orchestrator import CurriculumWorkflowOrchestrator
from application.agents.standards_mapper import StandardsMapperOutput, StandardMapping
from application.agents.curriculum_designer import (
    CurriculumDesignerOutput,
    CurriculumModule,
)
from application.agents.item_generator import ItemGeneratorOutput, GeneratedItem


class FakeStandardsMapper:
    def __init__(self, output):
        self.output = output

    def run(self, tenant_id, input_data):
        return self.output


class FakeCurriculumDesigner:
    def __init__(self, output):
        self.output = output

    def run(self, tenant_id, input_data):
        return self.output


class FakeItemGenerator:
    def __init__(self, output):
        self.output = output

    def run(self, input_data):
        return self.output


class InMemoryAgentRunRepository:
    def __init__(self):
        self.saved = []

    def add(self, run):
        self.saved.append(run)

    def update_status(self, run_id, tenant_id, status):
        for run in self.saved:
            if run.id == run_id:
                run.status = status


class InMemoryAssessmentItemRepository:
    def __init__(self):
        self.saved = []

    def add_many(self, items):
        self.saved.extend(items)


def _mapping():
    return StandardMapping(
        standard="STD-1",
        description="desc",
        document_title="doc.pdf",
        page_number=3,
    )


def _module():
    return CurriculumModule(
        module_title="Module 1",
        objective="Do the thing",
        standard="STD-1",
        document_title="doc.pdf",
        page_number=3,
    )


def _item():
    return GeneratedItem(
        module_title="Module 1",
        question="What is the thing?",
        answer_key="The thing",
        standard="STD-1",
        document_title="doc.pdf",
        page_number=3,
    )


def make_orchestrator(mapper_output, designer_output, generator_output):
    run_repo = InMemoryAgentRunRepository()
    item_repo = InMemoryAssessmentItemRepository()

    orchestrator = CurriculumWorkflowOrchestrator(
        standards_mapper=FakeStandardsMapper(mapper_output),
        curriculum_designer=FakeCurriculumDesigner(designer_output),
        item_generator=FakeItemGenerator(generator_output),
        agent_run_repository=run_repo,
        assessment_item_repository=item_repo,
    )

    return orchestrator, run_repo, item_repo


def test_full_pipeline_produces_pending_approval_items():
    mapper_output = StandardsMapperOutput(
        learning_goal="goal", mappings=[_mapping()]
    )
    designer_output = CurriculumDesignerOutput(
        learning_goal="goal", modules=[_module()]
    )
    generator_output = ItemGeneratorOutput(learning_goal="goal", items=[_item()])

    orchestrator, run_repo, item_repo = make_orchestrator(
        mapper_output, designer_output, generator_output
    )

    result = orchestrator.run(tenant_id="tenant-1", learning_goal="goal")

    assert result.status == "awaiting_approval"
    assert len(result.steps) == 3
    assert all(step.status == "success" for step in result.steps)
    assert len(item_repo.saved) == 1
    assert item_repo.saved[0].status == "pending_approval"


def test_no_standards_found_degrades_without_guessing():
    mapper_output = StandardsMapperOutput(learning_goal="goal", mappings=[])

    orchestrator, run_repo, item_repo = make_orchestrator(
        mapper_output,
        CurriculumDesignerOutput(learning_goal="goal", modules=[]),
        ItemGeneratorOutput(learning_goal="goal", items=[]),
    )

    result = orchestrator.run(tenant_id="tenant-1", learning_goal="goal")

    assert result.status == "completed_no_evidence"
    assert len(item_repo.saved) == 0
    # Only the standards_mapper step ran - the pipeline stopped early.
    assert len(result.steps) == 1


def test_step_failure_marks_run_failed_and_stops_pipeline():
    class AlwaysFailingMapper:
        def run(self, tenant_id, input_data):
            raise RuntimeError("LLM is down")

    run_repo = InMemoryAgentRunRepository()
    item_repo = InMemoryAssessmentItemRepository()

    orchestrator = CurriculumWorkflowOrchestrator(
        standards_mapper=AlwaysFailingMapper(),
        curriculum_designer=FakeCurriculumDesigner(None),
        item_generator=FakeItemGenerator(None),
        agent_run_repository=run_repo,
        assessment_item_repository=item_repo,
    )

    result = orchestrator.run(tenant_id="tenant-1", learning_goal="goal")

    assert result.status == "failed"
    assert len(item_repo.saved) == 0
    # Retried MAX_RETRIES_PER_STEP times, all failed.
    assert len(result.steps) == CurriculumWorkflowOrchestrator.MAX_RETRIES_PER_STEP
    assert all(step.status == "failed" for step in result.steps)


def test_step_timeout_marks_run_failed_and_retries():
    class SlowMapper:
        def run(self, tenant_id, input_data):
            time.sleep(0.2)
            return None

    run_repo = InMemoryAgentRunRepository()
    item_repo = InMemoryAssessmentItemRepository()

    orchestrator = CurriculumWorkflowOrchestrator(
        standards_mapper=SlowMapper(),
        curriculum_designer=FakeCurriculumDesigner(None),
        item_generator=FakeItemGenerator(None),
        agent_run_repository=run_repo,
        assessment_item_repository=item_repo,
    )

    orchestrator.STEP_TIMEOUT_SECONDS = 0.05

    result = orchestrator.run(
        tenant_id="tenant-1",
        learning_goal="goal",
    )

    assert result.status == "failed"
    assert len(result.steps) == 2
    assert all(step.status == "failed" for step in result.steps)
    assert all("exceeded 0.05s" in step.error for step in result.steps)