# AI Server Startup Guide

This guide explains how to start the FastAPI AI server for:
- Speech-to-Text (STT)
- Text correction
- **Grammar Grading** (NEW: merged from grammar-nlp-service)

## Prerequisites

1. **Python 3.8+** installed
2. **pip** package manager
3. **Virtual environment** (recommended)
4. **OpenAI API Key** (for grammar grading feature)

## Installation Steps

### 1. Navigate to the AI Server Directory

```bash
cd Ai_project/APIServer
```

### 2. Configure Environment Variables

Create a `.env` file in the `Ai_project/APIServer` directory:

```bash
cp .env.example .env
```

Then edit the `.env` file and add your OpenAI API key:

```env
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4o
WHISPER_MODEL_SIZE=base
```

**Important**:
- The `.env` file is already in `.gitignore` to prevent exposing your API key
- You can get an OpenAI API key from: https://platform.openai.com/api-keys
- Without an API key, the grammar grading endpoint will not work

### 3. Create a Virtual Environment (Recommended)

```bash
# On Linux/Mac
python3 -m venv venv
source venv/bin/activate

# On Windows
python -m venv venv
venv\Scripts\activate
```

### 4. Install Dependencies

```bash
pip install -r requirements.txt
```

**Note**: The first time you run this, it will download large models:
- Whisper model (for speech-to-text)
- T5 model (for text correction and grammar detection)

This may take several minutes depending on your internet connection.

**New dependencies** (automatically installed):
- `openai` - For OpenAI API integration
- `python-dotenv` - For loading environment variables

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
  "openai_client_loaded": true,
  "device": "cuda" or "cpu"
}
```

## Available Endpoints

1. **Health Check**: `GET /health`
2. **Text Correction**: `POST /api/v1/correct`
3. **Speech-to-Text**: `POST /api/v1/transcribe`
4. **Pronunciation Check**: `POST /api/v1/transcribe-and-compare`
5. **Grammar Grading** (NEW): `POST /api/v1/grade_text`

### Grammar Grading Endpoint Details

**Endpoint**: `POST /api/v1/grade_text`

**Request**:
```json
{
  "text": "I has a book and she have two pencil.",
  "language": "en-US"
}
```

**Response**:
```json
{
  "status": "success",
  "original_text": "I has a book and she have two pencil.",
  "grammar_errors": [
    {
      "message": "Có thể sai: 'has' nên là 'have'",
      "original": "has",
      "suggestion": "have",
      "position": 1,
      "rule": {"id": "T5_CORRECTION"}
    }
  ],
  "grading": {
    "score": 70,
    "level": "A1",
    "overall_comment": "Bài viết có một số lỗi cơ bản...",
    "suggestions": ["Cần ôn lại cách sử dụng đúng dạng động từ..."]
  }
}
```

**How it works**:
1. Uses **T5 model** (local) to detect grammar errors
2. Uses **OpenAI gpt-4o** to grade and provide Vietnamese feedback
3. Returns score (0-100), CEFR level (A1-C2), and suggestions in Vietnamese

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
- `[Grade] Received text: ...` - Grammar grading requests (NEW)
- `[Grade] Detected X errors` - Grammar error detection
- `[Grade] OpenAI response: ...` - AI scoring results

## Migration Notes (grammar-nlp-service)

**Important**: The `grammar-nlp-service` has been **merged** into this AI_project server.

### What Changed:

1. **Before**: Separate server at port 8000 (grammar-nlp-service)
2. **After**: Single unified server at port 8000 (AI_project/APIServer)

### Benefits:

- ✅ **No external API dependencies**: Uses local T5 model instead of LanguageTool API
- ✅ **Better performance**: No network latency for grammar checking
- ✅ **Cost effective**: Only pays for OpenAI API, not LanguageTool
- ✅ **Unified codebase**: Easier to maintain and deploy
- ✅ **Better security**: API keys in `.env` file (gitignored)

### What Stayed the Same:

- Same endpoint: `POST /api/v1/grade_text`
- Same request/response format
- Same port: 8000 (no backend changes needed)
- Vietnamese output preserved

### Backup:

If you need to rollback, the old `grammar-nlp-service` is backed up in:
```
E_Learning/grammar-nlp-service.backup/
```

You can restore it with:
```bash
cd /home/detdev/workspace/E_Learning
mv grammar-nlp-service.backup grammar-nlp-service
cd grammar-nlp-service
python -m uvicorn main:app --host 0.0.0.0 --port 8001  # Use different port!
```
