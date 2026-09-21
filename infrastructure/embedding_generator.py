from functools import lru_cache


@lru_cache(maxsize=1)
def get_model():
    from sentence_transformers import SentenceTransformer

    return SentenceTransformer("all-MiniLM-L6-v2")


def generate_embedding(text: str) -> list[float]:
    model = get_model()
    embedding = model.encode(text)
    return embedding.tolist()