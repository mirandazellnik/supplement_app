def validate_supplement_name(name: str) -> bool:
    return isinstance(name, str) and len(name.strip()) > 0
