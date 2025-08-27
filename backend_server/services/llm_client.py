import os
import requests

from backend_server.config import Config

OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"

def ask_openrouter(prompt):
    headers = {
        "Authorization": f"Bearer {Config.OPENROUTER_API_KEY}",
        "Content-Type": "application/json"
    }
    json_data = {
        "model": "gpt-4o-mini",
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.7
    }
    response = requests.post(OPENROUTER_URL, headers=headers, json=json_data)
    response.raise_for_status()
    data = response.json()

    # The response text is inside choices[0].message.content
    return data["choices"][0]["message"]["content"]