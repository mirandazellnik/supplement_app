from sentence_transformers import SentenceTransformer

model = SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')

def embed_text(texts):
    """
    Accepts a list of texts (strings), returns list of embeddings.
    """
    embeddings = model.encode(texts, convert_to_numpy=True)
    return embeddings