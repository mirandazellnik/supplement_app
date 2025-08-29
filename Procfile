# Web process: Flask API served by Gunicorn + SocketIO
web: gunicorn -b 0.0.0.0:5000 backend_server.app:app --worker-class gevent --workers 1

# Celery worker process
worker: celery -A backend_server.services.celery_worker.celery worker --loglevel=info --pool=solo
