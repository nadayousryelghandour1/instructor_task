from sqlalchemy.orm import Session

from infrastructure.models import AssessmentItemModel
from domain.assessment_item import AssessmentItem


class AssessmentItemRepository:
    def __init__(self, session: Session):
        self.session = session

    def add_many(self, items: list[AssessmentItem]) -> None:
        models = [
            AssessmentItemModel(
                id=item.id,
                tenant_id=item.tenant_id,
                run_id=item.run_id,
                module_title=item.module_title,
                question=item.question,
                answer_key=item.answer_key,
                standard=item.standard,
                document_title=item.document_title,
                page_number=item.page_number,
                status=item.status,
                reviewed_by=item.reviewed_by,
                review_comment=item.review_comment,
            )
            for item in items
        ]

        self.session.add_all(models)
        self.session.commit()

    def get_by_run_id(self, run_id: str, tenant_id: str) -> list[AssessmentItem]:
        models = (
            self.session.query(AssessmentItemModel)
            .filter(
                AssessmentItemModel.run_id == run_id,
                AssessmentItemModel.tenant_id == tenant_id,
            )
            .all()
        )

        return [self._to_domain(m) for m in models]

    def get_pending_by_tenant(self, tenant_id: str) -> list[AssessmentItem]:
        models = (
            self.session.query(AssessmentItemModel)
            .filter(
                AssessmentItemModel.tenant_id == tenant_id,
                AssessmentItemModel.status == "pending_approval",
            )
            .all()
        )

        return [self._to_domain(m) for m in models]

    def get_by_id(self, item_id: str, tenant_id: str) -> AssessmentItem | None:
        model = (
            self.session.query(AssessmentItemModel)
            .filter(
                AssessmentItemModel.id == item_id,
                AssessmentItemModel.tenant_id == tenant_id,
            )
            .first()
        )

        if model is None:
            return None

        return self._to_domain(model)

    def update_review(
        self,
        item_id: str,
        tenant_id: str,
        status: str,
        reviewed_by: str,
        review_comment: str | None,
        question: str | None = None,
        answer_key: str | None = None,
    ) -> AssessmentItem | None:
        model = (
            self.session.query(AssessmentItemModel)
            .filter(
                AssessmentItemModel.id == item_id,
                AssessmentItemModel.tenant_id == tenant_id,
            )
            .first()
        )

        if model is None:
            return None

        model.status = status
        model.reviewed_by = reviewed_by
        model.review_comment = review_comment

        if question is not None:
            model.question = question

        if answer_key is not None:
            model.answer_key = answer_key

        self.session.commit()

        return self._to_domain(model)

    def _to_domain(self, model: AssessmentItemModel) -> AssessmentItem:
        return AssessmentItem(
            id=model.id,
            tenant_id=model.tenant_id,
            run_id=model.run_id,
            module_title=model.module_title,
            question=model.question,
            answer_key=model.answer_key,
            standard=model.standard,
            document_title=model.document_title,
            page_number=model.page_number,
            status=model.status,
            reviewed_by=model.reviewed_by,
            review_comment=model.review_comment,
        )
