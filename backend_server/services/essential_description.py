from flask import jsonify

from backend_server.services.llm_client import ask_openrouter
from backend_server.utils.database_tools.top_by_essentials import get_ingredient_ids
from backend_server.utils.database_tools.ingredient_descriptions import get_ingredient_description, set_ingredient_description

def _get_new_description(essential_name):
    response = ask_openrouter(f"""
Give me a short, roughly 3-sentence blurb about {essential_name}, as it is used in supplements. Describe its common function in supplements (for humans), the common positive effects it has on humans, and any common potential risks that can occur from taking supplements which contain it. Your response should not contain any markdown formatting, newline characters, tab characters, or other attempts at formatting.
""")

    return response
    

def get_essential_description(essential_name):
    essential_id = get_ingredient_ids([essential_name])
    essential_id = essential_id[0]

    print(f"[[[ID: {essential_id}")

    desc = get_ingredient_description(essential_id)

    print(f"[[[OLD DESC: {desc}")

    if not desc:
        desc = _get_new_description(essential_name)
        print(f"[[[NEW DESC: {desc}")

        set_ingredient_description(desc)
    
    return desc
