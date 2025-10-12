# backend_server/services/celery_worker.py
"""
Celery Task base with lazy Flask app binding to avoid circular import.
This module only configures a Task base class that, on first task run,
creates the Flask app and binds the Celery Task context.
"""

from backend_server.services.make_celery import celery

# _flask_app will be created lazily on first task invocation
_flask_app = None

def _ensure_flask_app():
    """Create Flask app and bind Celery if not already done.
       This import is done lazily to avoid circular imports at module import time.
    """
    global _flask_app
    if _flask_app is None:
        # Import inside function to avoid circular imports at module import time
        from backend_server.app import create_app
        from backend_server.services.init_celery import init_celery

        _flask_app = create_app()
        # Bind Celery tasks to Flask app context
        init_celery(celery, _flask_app)

class ContextTask(celery.Task):
    """Task that ensures a Flask app context is available when run."""
    def __call__(self, *args, **kwargs):
        _ensure_flask_app()
        # _flask_app is guaranteed to exist now
        with _flask_app.app_context():
            return self.run(*args, **kwargs)

# Replace Celery's Task base
celery.Task = ContextTask

# NOTE: Do NOT import tasks here. Tasks should import celery instance directly
# (from make_celery) to avoid triggering create_app() during imports.