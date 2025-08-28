import os
from celery import Celery

REDIS_URL = os.getenv("REDIS_URL")  # Provided by Railway

celery = Celery(
    "tasks",
    broker=REDIS_URL,
    backend=REDIS_URL,
)

def init_celery(flask_app):
    celery.conf.update(flask_app.config)

    class ContextTask(celery.Task):
        def __call__(self, *args, **kwargs):
            with flask_app.app_context():
                return self.run(*args, **kwargs)

    celery.Task = ContextTask
    return celery

# Import tasks to register them
try:
    import backend_server.services.tasks
except ImportError:
    print("Could not import tasks module")