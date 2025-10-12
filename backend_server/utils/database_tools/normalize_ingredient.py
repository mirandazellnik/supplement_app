import re

def normalize_ingredient(name: str) -> str:
    """
    Normalize ingredient names for deduplication:
    - Lowercase
    - Remove punctuation except alphanumerics and spaces
    - Remove parentheses and contents inside
    - Collapse multiple spaces
    - Normalize hyphens (e.g., B-12 -> B12)
    """
    if not name:
        return ""
    name = name.lower()
    # remove parentheses and contents inside
    name = re.sub(r"\(.*?\)", "", name)
    # remove punctuation (except alphanumeric and space)
    name = re.sub(r"[^a-z0-9\s]", "", name)
    # remove extra spaces
    name = re.sub(r"\s+", " ", name).strip()
    return name