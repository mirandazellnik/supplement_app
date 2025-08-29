# entrypoint.py
import os
import subprocess
import sys

print("Running migrations...")
subprocess.run(["flask", "db", "upgrade"], check=True)

print("Starting Gunicorn...")
os.execvp("gunicorn", [
    "gunicorn",
    "-b", "0.0.0.0:5000",
    "backend_server.app:app",
    "--worker-class", "gevent",
    "--workers", "1",
    "--capture-output",
    "--log-level=debug"
])