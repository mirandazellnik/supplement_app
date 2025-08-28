# Base image
FROM python:3.10-slim

# Working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    python3-dev \
    libffi-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Create isolated venv
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Remove any system setuptools/pkg_resources to avoid the 'symbol' bug
RUN apt-get purge -y python3-setuptools || true
RUN rm -rf /usr/lib/python3/dist-packages/pkg_resources* || true
RUN rm -rf /usr/lib/python3.10/dist-packages/pkg_resources* || true

# Upgrade pip/setuptools/wheel in venv
RUN pip install --upgrade pip wheel
RUN pip install --upgrade --force-reinstall setuptools==70.0.0

# Copy requirements and install Python dependencies
COPY backend_server/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Install PyTorch CPU builds
RUN pip install --no-cache-dir \
    torch==2.3.0+cpu \
    torchvision==0.18.0+cpu \
    torchaudio==2.3.0+cpu \
    -f https://download.pytorch.org/whl/torch_stable.html

# Install sentence-transformers and dependencies
RUN pip install --no-cache-dir \
    sentence-transformers==5.1.0 \
    "tokenizers>=0.14.0" \
    regex

# Copy backend code
COPY backend_server ./backend_server

# Expose the web port
EXPOSE 5000

# Final safeguard: remove any leftover old pkg_resources and reinstall setuptools
RUN rm -rf /opt/venv/lib/python3.10/site-packages/pkg_resources* && \
    pip install --upgrade --force-reinstall setuptools==70.0.0

# Start Gunicorn server
CMD ["gunicorn", "-b", "0.0.0.0:5000", "backend_server.app:app"]
