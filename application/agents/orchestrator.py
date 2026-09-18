import time
from concurrent.futures import ThreadPoolExecutor, TimeoutError as FutureTimeoutError
from datetime import datetime, timezone

from application.agents.standards_mapper import (
    StandardsMapperAgent,
    StandardsMapperInput,
)
from application.agents.curriculum_designer import (
    CurriculumDesignerAgent,
    CurriculumDesignerInput,
)
from application.agents.item_generator import (
    ItemGeneratorAgent,
    ItemGeneratorInput,
)
from domain.agent_run import AgentRun, AgentStep
from domain.assessment_item import AssessmentItem


class CurriculumWorkflowOrchestrator:
    """
    Supervisor-style orchestrator for the D3 (Education) workflow:

        Standards Mapper -> Curriculum Designer -> Item Generator -> HUMAN APPROVAL

    Each step runs in sequence. A step that raises is retried with a linear
    backoff up to MAX_RETRIES_PER_STEP; a step that exceeds
    STEP_TIMEOUT_SECONDS is treated as failed.

    If a step exhausts its retries, the orchestrator does NOT continue the
    pipeline with guessed input for the next agent. It stops, persists
    whatever ran so far for inspection, and marks the run 'failed'.

    No item this orchestrator produces is ever returned to the caller as
    final: every generated item is persisted with status 'pending_approval'
    and requires a Lead Instructor to approve, reject, or edit-and-approve it
    before it is usable.

    Every step is recorded on the AgentRun for later inspection.
    """

    MAX_RETRIES_PER_STEP = 2
    STEP_TIMEOUT_SECONDS = 30

    def __init__(
        self,
        standards_mapper: StandardsMapperAgent,
        curriculum_designer: CurriculumDesignerAgent,
        item_generator: ItemGeneratorAgent,
        agent_run_repository,
        assessment_item_repository,
    ):
        self.standards_mapper = standards_mapper
        self.curriculum_designer = curriculum_designer
        self.item_generator = item_generator
        self.agent_run_repository = agent_run_repository
        self.assessment_item_repository = assessment_item_repository

    def run(self, tenant_id: str, learning_goal: str) -> AgentRun:
        agent_run = AgentRun(
            tenant_id=tenant_id,
            learning_goal=learning_goal,
            status="running",
        )

        # --- Step 1: Standards Mapper -----------------------------------
        mapper_output = self._run_step(
            agent_run=agent_run,
            agent_name="standards_mapper",
            input_summary=learning_goal,
            fn=lambda: self.standards_mapper.run(
                tenant_id=tenant_id,
                input_data=StandardsMapperInput(
                    learning_goal=learning_goal
                ),
            ),
        )

        if mapper_output is None:
            return self._finish(agent_run, "failed")

        if not mapper_output.mappings:
            return self._finish(agent_run, "completed_no_evidence")

        standards = [m.model_dump() for m in mapper_output.mappings]

        # --- Step 2: Curriculum Designer --------------------------------
        designer_output = self._run_step(
            agent_run=agent_run,
            agent_name="curriculum_designer",
            input_summary=f"{len(standards)} mapped standard(s)",
            fn=lambda: self.curriculum_designer.run(
                tenant_id=tenant_id,
                input_data=CurriculumDesignerInput(
                    learning_goal=learning_goal,
                    standards=standards,
                ),
            ),
        )

        if designer_output is None:
            return self._finish(agent_run, "failed")

        if not designer_output.modules:
            return self._finish(agent_run, "completed_no_evidence")

        modules = [m.model_dump() for m in designer_output.modules]

        # --- Step 3: Item Generator --------------------------------------
        generator_output = self._run_step(
            agent_run=agent_run,
            agent_name="item_generator",
            input_summary=f"{len(modules)} module(s)",
            fn=lambda: self.item_generator.run(
                input_data=ItemGeneratorInput(
                    learning_goal=learning_goal,
                    modules=modules,
                ),
            ),
        )

        if generator_output is None:
            return self._finish(agent_run, "failed")

        if not generator_output.items:
            return self._finish(agent_run, "completed_no_evidence")

        # --- Persist run + draft items, then STOP for human approval -----
        agent_run.status = "awaiting_approval"
        self.agent_run_repository.add(agent_run)

        items = [
            AssessmentItem(
                tenant_id=tenant_id,
                run_id=agent_run.id,
                module_title=item.module_title,
                question=item.question,
                answer_key=item.answer_key,
                standard=item.standard,
                document_title=item.document_title,
                page_number=item.page_number,
                status="pending_approval",
            )
            for item in generator_output.items
        ]

        self.assessment_item_repository.add_many(items)

        return agent_run

    def _finish(self, agent_run: AgentRun, status: str) -> AgentRun:
        agent_run.status = status
        self.agent_run_repository.add(agent_run)
        return agent_run

    def _run_step(
        self,
        agent_run: AgentRun,
        agent_name: str,
        input_summary: str,
        fn,
    ):
        """
        Runs a single agent step with retry-with-backoff and per-step timeout.

        Returns the step's output if successful.
        Returns None once all retries are exhausted.
        """

        last_error = None

        for attempt in range(1, self.MAX_RETRIES_PER_STEP + 1):
            started_at = datetime.now(timezone.utc).isoformat()

            executor = ThreadPoolExecutor(max_workers=1)
            future = executor.submit(fn)

            try:
                output = future.result(
                    timeout=self.STEP_TIMEOUT_SECONDS
                )

                executor.shutdown(wait=True)

                agent_run.steps.append(
                    AgentStep(
                        agent_name=agent_name,
                        status="success",
                        input_summary=input_summary,
                        output_summary=self._summarize(output),
                        started_at=started_at,
                        finished_at=datetime.now(
                            timezone.utc
                        ).isoformat(),
                    )
                )

                return output

            except FutureTimeoutError:
                future.cancel()
                executor.shutdown(
                    wait=False,
                    cancel_futures=True,
                )

                last_error = (
                    f"{agent_name} exceeded "
                    f"{self.STEP_TIMEOUT_SECONDS}s"
                )

            except Exception as exc:
                executor.shutdown(
                    wait=False,
                    cancel_futures=True,
                )

                last_error = str(exc)

            agent_run.steps.append(
                AgentStep(
                    agent_name=agent_name,
                    status="failed",
                    input_summary=input_summary,
                    output_summary="",
                    started_at=started_at,
                    finished_at=datetime.now(
                        timezone.utc
                    ).isoformat(),
                    error=(
                        f"attempt {attempt}/"
                        f"{self.MAX_RETRIES_PER_STEP}: "
                        f"{last_error}"
                    ),
                )
            )

            if attempt < self.MAX_RETRIES_PER_STEP:
                time.sleep(0.5 * attempt)

        return None

    @staticmethod
    def _summarize(output) -> str:
        if hasattr(output, "mappings"):
            return f"{len(output.mappings)} standard mapping(s)"

        if hasattr(output, "modules"):
            return f"{len(output.modules)} module(s)"

        if hasattr(output, "items"):
            return f"{len(output.items)} item(s)"

        return str(output)[:200]


