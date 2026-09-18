class ApproveAssessmentItemUseCase:
    """
    Implements the human approval gate (principle #2 - the human holds the
    pen). Only a lead_instructor or admin may approve, reject, or
    edit-and-approve a drafted assessment item - enforced here, not just by
    hiding a button in the UI (FR-8). Every decision is recorded against the
    item (who reviewed it, when, and any comment) so it stays auditable
    (principle #3 / FR-9). Once every item on a run has been reviewed, the
    parent run is marked 'completed'.
    """

    ALLOWED_ROLES = {"lead_instructor", "admin"}
    ALLOWED_DECISIONS = {"approve", "reject", "edit_and_approve"}

    def __init__(self, assessment_item_repository, agent_run_repository):
        self.assessment_item_repository = assessment_item_repository
        self.agent_run_repository = agent_run_repository

    def execute(
        self,
        tenant_id: str,
        item_id: str,
        reviewer_id: str,
        reviewer_role: str,
        decision: str,
        comment: str | None = None,
        edited_question: str | None = None,
        edited_answer_key: str | None = None,
    ):
        if reviewer_role not in self.ALLOWED_ROLES:
            raise PermissionError(
                "Only a lead_instructor or admin may review assessment items."
            )

        if decision not in self.ALLOWED_DECISIONS:
            raise ValueError(f"Unknown decision: {decision}")

        item = self.assessment_item_repository.get_by_id(
            item_id=item_id,
            tenant_id=tenant_id,
        )

        if item is None:
            return None

        if item.status != "pending_approval":
            raise ValueError(
                f"Item {item_id} was already reviewed (status={item.status})."
            )

        new_status = "rejected" if decision == "reject" else "approved"

        updated_item = self.assessment_item_repository.update_review(
            item_id=item_id,
            tenant_id=tenant_id,
            status=new_status,
            reviewed_by=reviewer_id,
            review_comment=comment,
            question=edited_question if decision == "edit_and_approve" else None,
            answer_key=edited_answer_key if decision == "edit_and_approve" else None,
        )

        self._maybe_close_run(tenant_id=tenant_id, run_id=updated_item.run_id)

        return updated_item

    def _maybe_close_run(self, tenant_id: str, run_id: str) -> None:
        items = self.assessment_item_repository.get_by_run_id(
            run_id=run_id,
            tenant_id=tenant_id,
        )

        if items and all(i.status != "pending_approval" for i in items):
            self.agent_run_repository.update_status(
                run_id=run_id,
                tenant_id=tenant_id,
                status="completed",
            )
