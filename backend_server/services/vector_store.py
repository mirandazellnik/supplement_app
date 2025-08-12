import chromadb
from chromadb.config import Settings

from services.embeddings import embed_text

settings = Settings(
    persist_directory="./chroma_db",
    anonymized_telemetry=False,
)

client = chromadb.Client(settings)

collection_name = "supplement_knowledge"

if collection_name not in [c.name for c in client.list_collections()]:
    collection = client.create_collection(name=collection_name)
else:
    collection = client.get_collection(collection_name)

def add_documents(docs):
    """
    docs: list of dicts with 'id' and 'text' keys
    """
    texts = [d["text"] for d in docs]
    ids = [d["id"] for d in docs]
    embeddings = embed_text(texts).tolist()
    collection.add(documents=texts, embeddings=embeddings, ids=ids)

def vector_search(query, top_k=5):
    query_emb = embed_text([query]).tolist()[0]
    results = collection.query(query_embeddings=[query_emb], n_results=top_k)
    docs = []
    for doc, score, _id in zip(results['documents'][0], results['distances'][0], results['ids'][0]):
        docs.append({"text": doc, "score": score, "id": _id})
    return docs