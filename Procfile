# Web process: Flask API served by Gunicorn
web: gunicorn -b 0.0.0.0:5000 backend_server.app:app

# Celery worker process
worker: celery -A backend_server.services.celery_worker.celery worker --loglevel=info --pool=solo
