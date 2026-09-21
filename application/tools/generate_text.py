"""
Tool: generate_text

A read-only tool (no external side effects — it does not write to any
store). Given a prompt, returns the LLM's generated text. Wraps
LLMService so agents call a named "tool" rather than an infrastructure
class directly.
"""


class GenerateTextTool:
    name = "generate_text"
    description = "Generate text from a prompt using the configured LLM provider."
    is_write_tool = False

    def __init__(self, llm_service):
        self._llm_service = llm_service

    def run(self, prompt: str) -> str:
        return self._llm_service.generate(prompt)