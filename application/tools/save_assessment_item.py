"""
Tool: save_assessment_item

The ONE write/side-effecting tool in this system. It persists a
generated assessment item to the database with status "pending_approval".

CRITICAL SAFETY RULE (per the assignment brief):
No destructive/write tool may execute without passing the human
approval gate. This tool enforces that by construction: the status
passed into the domain object is ALWAYS "pending_approval" — it is
not a caller-supplied parameter, so there is no code path here that
can create an already-"approved" item. The only way an item's status
becomes "approved" is through ApproveAssessmentItemUseCase, which
requires an authenticated lead_instructor/admin calling the separate
POST /workflow/items/{item_id}/review endpoint.

In other words: this tool writes data, but it cannot itself bypass
the approval gate — the gate is a separate, later step that no code
path here can skip.
"""

import uuid

from domain.assessment_item import AssessmentItem


class SaveAssessmentItemTool:
    name = "save_assessment_item"
    description = (
        "Persist a generated assessment item. Always saved with status "
        "'pending_approval' — this tool can never mark an item as approved."
    )
    is_write_tool = True

    def __init__(self, assessment_item_repository):
        self._assessment_item_repository = assessment_item_repository

    def run(
        self,
        tenant_id: str,
        run_id: str,
        module_title: str,
        question: str,
        answer_key: str,
        standard: str,
        document_title: str,
        page_number: int,
    ):
        item = AssessmentItem(
            id=str(uuid.uuid4()),
            tenant_id=tenant_id,
            run_id=run_id,
            module_title=module_title,
            question=question,
            answer_key=answer_key,
            standard=standard,
            document_title=document_title,
            page_number=page_number,
            status="pending_approval",
            reviewed_by=None,
            review_comment=None,
        )

        self._assessment_item_repository.add_many([item])
        return item