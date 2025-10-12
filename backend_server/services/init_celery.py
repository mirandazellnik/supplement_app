# backend_server/utils/celery_utils.py
def init_celery(celery, flask_app):
    """Bind Flask application context to Celery tasks."""
    celery.conf.update(flask_app.config)

    class ContextTask(celery.Task):
        def __call__(self, *args, **kwargs):
            with flask_app.app_context():
                return self.run(*args, **kwargs)

    celery.Task = ContextTask
    return celery