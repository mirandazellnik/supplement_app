# Use a small Python base image
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy only requirements first (for caching)
COPY requirements.txt .

# Install lightweight requirements
RUN pip install --no-cache-dir -r requirements.txt

# Install CPU-only PyTorch + torchvision + torchaudio
RUN pip install --no-cache-dir \
    torch==2.3.0+cpu \
    torchvision==0.18.0+cpu \
    torchaudio==2.3.0+cpu \
    -f https://download.pytorch.org/whl/torch_stable.html

# Install sentence-transformers with minimal dependencies
RUN pip install --no-cache-dir \
    sentence-transformers==5.1.0 \
    "tokenizers>=0.14.0" \
    regex

# Copy the app code
COPY . .

# Expose port 5000
EXPOSE 5000

# Run the app using gunicorn
# UNSURE WHETHER THIS WILL WORK
CMD ["gunicorn", "-b", "0.0.0.0:5000", "backend_server.app:app"]
