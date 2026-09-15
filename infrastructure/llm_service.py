from openai import OpenAI
from config import settings


class LLMService:

    def __init__(self):
        self.client = OpenAI(
            api_key=settings.groq_api_key,
            base_url="https://api.groq.com/openai/v1",
        )

    def generate(self, prompt: str) -> str:

        response = self.client.chat.completions.create(
            model="openai/gpt-oss-120b",
            messages=[
                {"role": "user", "content": prompt}
            ]
        )

        return response.choices[0].message.content