from pydantic import BaseModel

from application.tools.search_corpus_tool import SearchCorpusTool
from application.tools.generate_text import GenerateTextTool


class StandardsMapperInput(BaseModel):
    learning_goal: str


class StandardMapping(BaseModel):
    standard: str
    description: str
    document_title: str
    page_number: int


class StandardsMapperOutput(BaseModel):
    learning_goal: str
    mappings: list[StandardMapping]


class StandardsMapperAgent:
    """
    First agent in the D3 workflow. Maps a learning goal to concrete
    competencies/topics found in the tenant's corpus.

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
        input_data: StandardsMapperInput,
    ) -> StandardsMapperOutput:

        chunks = self.search_corpus_tool.run(
            tenant_id=tenant_id,
            query=input_data.learning_goal,
            top_k=5,
        )

        print("RETRIEVED CHUNKS:")
        for score, chunk in chunks:
            print("SCORE:", score)
            print("PAGE:", chunk.page_number)
            print("TEXT:", chunk.text)
            print("-" * 50)

        context = "\n\n".join(
            f"Page {chunk.page_number}:\n{chunk.text}"
            for _, chunk in chunks
        )

        prompt = f"""
You are a Standards Mapper Agent in an education system.

Your task: identify the key competencies and topics covered in the
retrieved course material that relate to the learning goal below.
A "standard" here means a specific, nameable competency, concept,
or skill the material teaches (e.g. "Digital Modulation Techniques",
"OFDM Fundamentals") — it does NOT need to match a formal external
standards framework (like Common Core or ABET).

Learning Goal:
{input_data.learning_goal}

Retrieved Context:
{context}

Based ONLY on the retrieved context, identify the competencies/topics
relevant to the learning goal.

Do not invent information. If the context does not cover the learning
goal at all, return an empty mappings list.

Return ONLY valid JSON using exactly this structure:

{{
    "learning_goal": "{input_data.learning_goal}",
    "mappings": [
        {{
            "standard": "the identified competency/topic name",
            "description": "explanation of what this competency covers",
            "document_title": "source document",
            "page_number": 1
        }}
    ]
}}
"""

        response = self.generate_text_tool.run(prompt)

        print("LLM RESPONSE:")
        print(response)

        return StandardsMapperOutput.model_validate_json(response)