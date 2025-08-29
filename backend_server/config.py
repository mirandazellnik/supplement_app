import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    DEBUG = os.getenv("DEBUG", "True").lower() == "true"
    OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
    #OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")

    SECRET_KEY = os.environ.get('SECRET_KEY') or 'you-will-never-guess'
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or 'sqlite:///app.db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY') or 'super-secret'  # For JWT tokens
    