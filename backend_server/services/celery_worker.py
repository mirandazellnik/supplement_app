# celery_worker.py
"""from celery import Celery

celery = Celery("tasks", broker="redis://localhost:6379/0", backend="redis://localhost:6379/0")

def init_celery(flask_app):
    celery.conf.update(flask_app.config)
    TaskBase = celery.Task
    class ContextTask(TaskBase):
        def __call__(self, *args, **kwargs):
            with flask_app.app_context():
                return TaskBase.__call__(self, *args, **kwargs)
    celery.Task = ContextTask
    return celery"""

from celery import Celery
celery = Celery(
    "tasks",
    broker="redis://localhost:6379/0",
    backend="redis://localhost:6379/0"
)

def init_celery(flask_app):
    celery.conf.update(flask_app.config)
    
    class ContextTask(celery.Task):
        def __call__(self, *args, **kwargs):
            with flask_app.app_context():
                return self.run(*args, **kwargs)
    
    celery.Task = ContextTask
    return celery

# Import tasks so they are registered
#from .tasks import fetch_label_details

# **This import is critical to register tasks**
# Use absolute import so Celery can find it
try:
    import backend_server.services.tasks
except ImportError:
    print("Could not import tasks module")