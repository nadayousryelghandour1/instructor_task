from pydantic import BaseModel

from application.tools.search_corpus_tool import SearchCorpusTool
from application.tools.generate_text import GenerateTextTool


class CurriculumDesignerInput(BaseModel):
    learning_goal: str
    standards: list[dict]  # [{standard, description, document_title, page_number}]


class CurriculumModule(BaseModel):
    module_title: str
    objective: str
    standard: str
    document_title: str
    page_number: int


class CurriculumDesignerOutput(BaseModel):
    learning_goal: str
    modules: list[CurriculumModule]


class CurriculumDesignerAgent:
    """
    Second agent in the D3 workflow. Takes the standards mappings produced
    by the Standards Mapper agent and turns them into a short, sequenced
    module outline, grounded in the same retrieved corpus context.

    It never invents a module that isn't backed by a mapped standard: if the
    Standards Mapper found no evidence, this agent is never called (the
    orchestrator degrades gracefully instead of guessing).

    Tools used: search_corpus, generate_text (both read-only —
    see application/tools/).
    """

    def __init__(
        self,
        search_corpus_tool: SearchCorpusTool,
        generate_text_tool: GenerateTextTool,
    ):
        self.search_corpus_tool = search_corpus_tool
        self.generate_text_tool = generate_text_tool

    def run(
        self,
        tenant_id: str,
        input_data: CurriculumDesignerInput,
    ) -> CurriculumDesignerOutput:

        if not input_data.standards:
            return CurriculumDesignerOutput(
                learning_goal=input_data.learning_goal,
                modules=[],
            )

        chunks = self.search_corpus_tool.run(
            tenant_id=tenant_id,
            query=input_data.learning_goal,
            top_k=5,
        )

        context = "\n\n".join(
            f"Page {chunk.page_number}:\n{chunk.text}"
            for _, chunk in chunks
        )

        standards_block = "\n".join(
            f"- {s['standard']}: {s['description']} "
            f"(source: {s['document_title']}, page {s['page_number']})"
            for s in input_data.standards
        )

        prompt = f"""
You are a Curriculum Designer Agent in an education system.

Your task is to turn the learning goal and the mapped standards below into
a short, sequenced module outline (2 to 4 modules), grounded ONLY in the
retrieved context and the mapped standards.

Learning Goal:
{input_data.learning_goal}

Mapped Standards:
{standards_block}

Retrieved Context:
{context}

Instructions:
- Use ONLY the retrieved context and the mapped standards as source material.
- Every module must reference exactly one standard from the list above, and
  must reuse that standard's document_title and page_number exactly.
- Do not invent content, standards, or page numbers not present above.
- If there is not enough context to design a module, return an empty list.

Return ONLY valid JSON using exactly this structure:

{{
    "learning_goal": "{input_data.learning_goal}",
    "modules": [
        {{
            "module_title": "short module title",
            "objective": "what the learner will be able to do",
            "standard": "the standard this module addresses",
            "document_title": "source document",
            "page_number": 1
        }}
    ]
}}
"""

        response = self.generate_text_tool.run(prompt)

        return CurriculumDesignerOutput.model_validate_json(response)