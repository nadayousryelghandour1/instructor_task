from pydantic import BaseModel

from application.tools.generate_text import GenerateTextTool


class ItemGeneratorInput(BaseModel):
    learning_goal: str
    modules: list[dict]  # [{module_title, objective, standard, document_title, page_number}]


class GeneratedItem(BaseModel):
    module_title: str
    question: str
    answer_key: str
    standard: str
    document_title: str
    page_number: int


class ItemGeneratorOutput(BaseModel):
    learning_goal: str
    items: list[GeneratedItem]


class ItemGeneratorAgent:
    """
    Third agent in the D3 workflow. Drafts one assessment question and
    answer key per module produced by the Curriculum Designer agent.

    This agent NEVER finalizes or publishes an item - it only produces
    drafts. The orchestrator persists every item it returns with status
    'pending_approval', and a Lead Instructor must approve, reject, or
    edit-and-approve each one via the review endpoint before it counts as
    real output. This is the system's human-in-the-loop gate
    (principle #2 - the human holds the pen).

    Tool used: generate_text (read-only — see application/tools/).
    """

    def __init__(self, generate_text_tool: GenerateTextTool):
        self.generate_text_tool = generate_text_tool

    def run(self, input_data: ItemGeneratorInput) -> ItemGeneratorOutput:

        if not input_data.modules:
            return ItemGeneratorOutput(
                learning_goal=input_data.learning_goal,
                items=[],
            )

        modules_block = "\n\n".join(
            f"Module: {m['module_title']}\n"
            f"Objective: {m['objective']}\n"
            f"Standard: {m['standard']}\n"
            f"Source: {m['document_title']}, page {m['page_number']}"
            for m in input_data.modules
        )

        prompt = f"""
You are an Item Generator Agent in an education system.

Your task is to draft ONE assessment question with its answer key for EACH
module below, grounded ONLY in that module's stated objective and standard.

Learning Goal:
{input_data.learning_goal}

Modules:
{modules_block}

Instructions:
- Generate exactly one question per module, in the same order.
- Each question must be answerable using the module's objective alone - do
  not introduce facts, numbers, or claims that are not implied by it.
- Reuse each module's document_title and page_number exactly as given.
- These items are DRAFTS pending human review; never claim they are final
  or approved.

Return ONLY valid JSON using exactly this structure:

{{
    "learning_goal": "{input_data.learning_goal}",
    "items": [
        {{
            "module_title": "module title (as given)",
            "question": "the assessment question",
            "answer_key": "the expected answer",
            "standard": "the standard (as given)",
            "document_title": "source document (as given)",
            "page_number": 1
        }}
    ]
}}
"""

        response = self.generate_text_tool.run(prompt)

        return ItemGeneratorOutput.model_validate_json(response)