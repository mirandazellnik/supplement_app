# backend_server/services/celery_app.py
from celery import Celery
import os

def make_celery():
    redis_url = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    celery = Celery(
        "backend_server",
        broker=redis_url,
        backend=redis_url,
        include=[
            "backend_server.services.tasks"  # <-- important
        ]
    )
    return celery

celery = make_celery()
