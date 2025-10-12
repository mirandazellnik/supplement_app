# backend_server/services/celery_worker.py
import os
from celery import Celery
from backend_server.app import create_app  # ✅ import your Flask app factory

REDIS_URL = os.getenv("REDIS_URL") or "redis://localhost:6379/0"

celery = Celery(
    "tasks",
    broker=REDIS_URL,
    backend=REDIS_URL,
)

def init_celery(flask_app):
    """Attach Flask app context to Celery tasks."""
    celery.conf.update(flask_app.config)

    class ContextTask(celery.Task):
        def __call__(self, *args, **kwargs):
            with flask_app.app_context():
                return self.run(*args, **kwargs)

    celery.Task = ContextTask
    return celery

# --- Initialize Celery with Flask app when worker starts ---
flask_app = create_app()  # ✅ creates Flask app instance
init_celery(flask_app)    # ✅ attach app context to Celery

# --- Import tasks AFTER Celery has been initialized ---
import backend_server.services.tasks
