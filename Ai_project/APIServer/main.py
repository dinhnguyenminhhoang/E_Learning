import os
import torch
import traceback
import tempfile
import whisper
from fastapi import FastAPI, HTTPException, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from transformers import T5Tokenizer, T5ForConditionalGeneration
from difflib import SequenceMatcher

app = FastAPI(
    title="AI Language Learning API",
    description="API for spell checking using T5 and Speech-to-Text using Whisper.",
    version="2.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------------
# CONFIG
# -----------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "../T5_spellCheck/checkpoint-145000")
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
WHISPER_MODEL_SIZE = "base"  # Options: tiny, base, small, medium, large

print(f"Base Dir: {BASE_DIR}")
print(f"Attempting to load T5 model from: {os.path.abspath(MODEL_PATH)}")
print(f"Device: {DEVICE}")

# -----------------------------
# Load T5 Model & Tokenizer
# -----------------------------
try:
    print("Loading T5 tokenizer...")
    tokenizer = T5Tokenizer.from_pretrained("t5-large", legacy=False)
    
    print(f"Loading T5 model on {DEVICE}...")
    try:
        model = T5ForConditionalGeneration.from_pretrained(MODEL_PATH).to(DEVICE)
    except torch.OutOfMemoryError:
        print("⚠️ CUDA Out of Memory! Falling back to CPU for T5...")
        DEVICE = "cpu"
        torch.cuda.empty_cache()
        model = T5ForConditionalGeneration.from_pretrained(MODEL_PATH).to(DEVICE)
    except Exception as e:
        print(f"Error loading T5 on {DEVICE}, trying CPU... Error: {e}")
        DEVICE = "cpu"
        model = T5ForConditionalGeneration.from_pretrained(MODEL_PATH).to(DEVICE)

    model.eval()
    print(f"T5 Model loaded successfully on {DEVICE}!")
except Exception as e:
    print(f"CRITICAL ERROR loading T5 model: {e}")
    traceback.print_exc()
    model = None
    tokenizer = None

# -----------------------------
# Load Whisper Model
# -----------------------------
whisper_model = None
try:
    print(f"Loading Whisper {WHISPER_MODEL_SIZE} model...")
    whisper_model = whisper.load_model(WHISPER_MODEL_SIZE, device=DEVICE)
    print(f"Whisper model loaded successfully on {DEVICE}!")
except Exception as e:
    print(f"Error loading Whisper model: {e}")
    traceback.print_exc()
    # Try CPU fallback
    try:
        print("Trying to load Whisper on CPU...")
        whisper_model = whisper.load_model(WHISPER_MODEL_SIZE, device="cpu")
        print("Whisper model loaded successfully on CPU!")
    except Exception as e2:
        print(f"CRITICAL ERROR loading Whisper model: {e2}")
        whisper_model = None

# -----------------------------
# Request Models
# -----------------------------
class SpellCheckRequest(BaseModel):
    text: str

class TranscriptionResponse(BaseModel):
    status: str
    transcribed_text: str
    
class ComparisonResponse(BaseModel):
    status: str
    transcribed_text: str
    target_word: str
    accuracy: float
    is_correct: bool

# -----------------------------
# Utility Functions
# -----------------------------
def calculate_similarity(text1: str, text2: str) -> float:
    """Calculate similarity between two strings using SequenceMatcher."""
    text1 = text1.lower().strip()
    text2 = text2.lower().strip()
    
    if not text1 or not text2:
        return 0.0
    
    # Use SequenceMatcher for similarity ratio
    ratio = SequenceMatcher(None, text1, text2).ratio()
    return round(ratio * 100, 1)

def normalize_text(text: str) -> str:
    """Normalize text for comparison."""
    import re
    # Remove punctuation and extra spaces
    text = re.sub(r'[^\w\s]', '', text)
    text = re.sub(r'\s+', ' ', text)
    return text.lower().strip()

# -----------------------------
# T5 Spell Check Endpoint
# -----------------------------
@app.post("/api/v1/correct")
async def correct_text(payload: SpellCheckRequest):
    if not model or not tokenizer:
        print("Request failed: T5 Model or Tokenizer not loaded.")
        raise HTTPException(status_code=500, detail="T5 Model is not loaded. Check server logs.")

    input_text = payload.text
    print(f"[T5] Received text: {input_text}")
    
    if not input_text:
        return {"corrected_text": ""}

    input_with_prefix = f"grammar: {input_text}"

    try:
        encoded = tokenizer(
            [input_with_prefix],
            return_tensors="pt",
            padding=True,
            truncation=True,
            max_length=128
        ).to(DEVICE)

        with torch.no_grad():
            outputs = model.generate(
                **encoded,
                max_length=128,
                num_beams=2,
                early_stopping=True
            )

        corrected_text = tokenizer.decode(outputs[0], skip_special_tokens=True)
        
        if corrected_text.startswith("grammar:"):
            corrected_text = corrected_text.replace("grammar:", "", 1).strip()
            
        print(f"[T5] Corrected text: {corrected_text}")
        
        return {
            "status": "success",
            "original_text": input_text,
            "corrected_text": corrected_text
        }

    except Exception as e:
        print(f"[T5] Error during inference: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

# -----------------------------
# Whisper STT Endpoints
# -----------------------------
@app.post("/api/v1/transcribe")
async def transcribe_audio(audio: UploadFile = File(...)):
    """Transcribe audio file to text using Whisper."""
    if not whisper_model:
        raise HTTPException(status_code=500, detail="Whisper model is not loaded. Check server logs.")
    
    print(f"[Whisper] Received audio file: {audio.filename}, content_type: {audio.content_type}")
    
    # Save uploaded file to temp location
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as temp_file:
            content = await audio.read()
            temp_file.write(content)
            temp_path = temp_file.name
        
        print(f"[Whisper] Saved to temp file: {temp_path}")
        
        # Transcribe with Whisper
        result = whisper_model.transcribe(
            temp_path,
            language="en",  # Force English for vocabulary
            fp16=False if DEVICE == "cpu" else True
        )
        
        transcribed_text = result["text"].strip()
        print(f"[Whisper] Transcribed: {transcribed_text}")
        
        # Cleanup temp file
        os.unlink(temp_path)
        
        return {
            "status": "success",
            "transcribed_text": transcribed_text
        }
        
    except Exception as e:
        print(f"[Whisper] Error during transcription: {e}")
        traceback.print_exc()
        # Cleanup temp file if exists
        if 'temp_path' in locals() and os.path.exists(temp_path):
            os.unlink(temp_path)
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/transcribe-and-compare")
async def transcribe_and_compare(
    audio: UploadFile = File(...),
    target_word: str = Form(...)
):
    """Transcribe audio and compare with target word."""
    if not whisper_model:
        raise HTTPException(status_code=500, detail="Whisper model is not loaded. Check server logs.")
    
    print(f"[Whisper] Comparing pronunciation for: {target_word}")
    
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as temp_file:
            content = await audio.read()
            temp_file.write(content)
            temp_path = temp_file.name
        
        # Transcribe with Whisper
        result = whisper_model.transcribe(
            temp_path,
            language="en",
            fp16=False if DEVICE == "cpu" else True
        )
        
        transcribed_text = result["text"].strip()
        print(f"[Whisper] Transcribed: '{transcribed_text}' vs Target: '{target_word}'")
        
        # Cleanup temp file
        os.unlink(temp_path)
        
        # Normalize and compare
        normalized_transcription = normalize_text(transcribed_text)
        normalized_target = normalize_text(target_word)
        
        accuracy = calculate_similarity(normalized_transcription, normalized_target)
        is_correct = accuracy >= 80.0  # Consider 80%+ as correct
        
        print(f"[Whisper] Accuracy: {accuracy}%, Correct: {is_correct}")
        
        return {
            "status": "success",
            "transcribed_text": transcribed_text,
            "target_word": target_word,
            "accuracy": accuracy,
            "is_correct": is_correct
        }
        
    except Exception as e:
        print(f"[Whisper] Error: {e}")
        traceback.print_exc()
        if 'temp_path' in locals() and os.path.exists(temp_path):
            os.unlink(temp_path)
        raise HTTPException(status_code=500, detail=str(e))

# -----------------------------
# Health Check
# -----------------------------
@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "t5_model_loaded": model is not None,
        "whisper_model_loaded": whisper_model is not None,
        "device": DEVICE
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

