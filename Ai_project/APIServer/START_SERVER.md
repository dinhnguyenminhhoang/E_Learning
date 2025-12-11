# AI Server Startup Guide

This guide explains how to start the FastAPI AI server for Speech-to-Text (STT) and Text correction features.

## Prerequisites

1. **Python 3.8+** installed
2. **pip** package manager
3. **Virtual environment** (recommended)

## Installation Steps

### 1. Navigate to the AI Server Directory

```bash
cd Ai_project/APIServer
```

### 2. Create a Virtual Environment (Recommended)

```bash
# On Linux/Mac
python3 -m venv venv
source venv/bin/activate

# On Windows
python -m venv venv
venv\Scripts\activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

**Note**: The first time you run this, it will download large models:
- Whisper model (for speech-to-text)
- T5 model (for text correction)

This may take several minutes depending on your internet connection.

## Starting the Server

### Development Mode

```bash
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### Production Mode

```bash
python -m uvicorn main:app --host 0.0.0.0 --port 8000
```

## Verify the Server is Running

Once started, you should see:

```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process [xxxxx] using watchgod
```

### Test the Health Endpoint

Open your browser or use curl:

```bash
curl http://localhost:8000/health
```

You should see:

```json
{
  "status": "ok",
  "t5_model_loaded": true,
  "whisper_model_loaded": true,
  "device": "cuda" or "cpu"
}
```

## Available Endpoints

1. **Health Check**: `GET /health`
2. **Text Correction**: `POST /api/v1/correct`
3. **Speech-to-Text**: `POST /api/v1/transcribe`
4. **Pronunciation Check**: `POST /api/v1/transcribe-and-compare`

## Troubleshooting

### Error: "Module not found"

Make sure you've activated the virtual environment and installed all dependencies:

```bash
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
```

### Error: "CUDA out of memory"

The server will automatically fall back to CPU if CUDA runs out of memory. To force CPU mode:

```bash
export CUDA_VISIBLE_DEVICES=""
python -m uvicorn main:app --host 0.0.0.0 --port 8000
```

### Error: "Port 8000 already in use"

Check if another process is using port 8000:

```bash
# On Linux/Mac
lsof -i :8000

# On Windows
netstat -ano | findstr :8000
```

Change the port if needed:

```bash
python -m uvicorn main:app --host 0.0.0.0 --port 8001
```

**Important**: If you change the port, update the `FASTAPI_URL` environment variable in the backend:

```bash
# In backend/.env
FASTAPI_URL=http://localhost:8001
```

## Integration with Backend

The Node.js backend expects the FastAPI server to be running at:

```
http://localhost:8000
```

This is configured via the `FASTAPI_URL` environment variable in `backend/src/routes/stt.route.js`.

## Performance Notes

- **First Request**: May be slow as models are loaded into memory
- **Subsequent Requests**: Should be fast
- **GPU vs CPU**: GPU (CUDA) is 5-10x faster than CPU for inference
- **Model Size**: Whisper "base" model is ~150MB. You can change to "tiny" (faster, less accurate) or "small" (slower, more accurate) in `main.py`

## Stopping the Server

Press `CTRL+C` in the terminal where the server is running.

To deactivate the virtual environment:

```bash
deactivate
```

## Logs

Server logs will appear in the terminal. Look for:

- `[T5] Received text: ...` - Text correction requests
- `[Whisper] Received audio file: ...` - Speech-to-text requests
- `[Whisper] Comparing pronunciation for: ...` - Pronunciation check requests
