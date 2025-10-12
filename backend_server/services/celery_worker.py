# backend_server/services/celery_worker.py
"""
Celery Task base with lazy Flask app binding to avoid circular import.
"""

from backend_server.services.make_celery import celery

_flask_app = None

def _ensure_flask_app():
    """Create Flask app and bind Celery if not already done."""
    global _flask_app
    if _flask_app is None:
        from backend_server.app import create_app
        from backend_server.services.init_celery import init_celery

        _flask_app = create_app()
        init_celery(celery, _flask_app)

class ContextTask(celery.Task):
    """Wrap tasks in Flask app context."""
    def __call__(self, *args, **kwargs):
        _ensure_flask_app()
        with _flask_app.app_context():
            return self.run(*args, **kwargs)

celery.Task = ContextTask

# IMPORTANT: import tasks here AFTER Task is set
import backend_server.services.tasks
