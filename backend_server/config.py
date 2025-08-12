import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    DEBUG = os.getenv("DEBUG", "True").lower() == "true"
    OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
    #OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")