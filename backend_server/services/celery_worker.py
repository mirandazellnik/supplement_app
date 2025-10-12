# backend_server/services/celery_worker.py
from backend_server.services.make_celery import celery
from backend_server.app import create_app
from backend_server.services.init_celery import init_celery

flask_app = create_app()
init_celery(celery, flask_app)

# Import all tasks AFTER binding Flask
import backend_server.services.tasks