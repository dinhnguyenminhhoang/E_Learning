import os
import torch
import traceback
import tempfile
import whisper
import json
import re
from fastapi import FastAPI, HTTPException, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from transformers import T5Tokenizer, T5ForConditionalGeneration
from difflib import SequenceMatcher
from openai import OpenAI
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

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
WHISPER_MODEL_SIZE = os.getenv("WHISPER_MODEL_SIZE", "base")  # Options: tiny, base, small, medium, large

# OpenAI Configuration
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-3.5-turbo")

print(f"Base Dir: {BASE_DIR}")
print(f"Attempting to load T5 model from: {os.path.abspath(MODEL_PATH)}")
print(f"Device: {DEVICE}")
print(f"OpenAI Model: {OPENAI_MODEL}")

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
# Initialize OpenAI Client
# -----------------------------
openai_client = None
if OPENAI_API_KEY:
    try:
        openai_client = OpenAI(api_key=OPENAI_API_KEY)
        print("OpenAI client initialized successfully!")
    except Exception as e:
        print(f"Error initializing OpenAI client: {e}")
        openai_client = None
else:
    print("⚠️ OPENAI_API_KEY not found. Grammar grading endpoint will not work.")

# -----------------------------
# Request Models
# -----------------------------
class SpellCheckRequest(BaseModel):
    text: str

class GrammarGradeRequest(BaseModel):
    text: str
    language: str = "en-US"

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
# Grammar Grading Helper Functions
# -----------------------------
def detect_grammar_errors_with_t5(text: str):
    """
    Sử dụng T5 model để phát hiện lỗi ngữ pháp bằng cách so sánh text gốc với text đã sửa.
    Trả về danh sách các lỗi được phát hiện.
    """
    if not model or not tokenizer:
        raise HTTPException(status_code=500, detail="T5 Model is not loaded.")

    input_with_prefix = f"grammar: {text}"

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

        # So sánh text gốc với text đã sửa để tìm lỗi
        errors = []
        if text.lower().strip() != corrected_text.lower().strip():
            # Tách thành từng câu để phân tích chi tiết hơn
            original_words = text.split()
            corrected_words = corrected_text.split()

            # Tìm điểm khác biệt
            for i, (orig, corr) in enumerate(zip(original_words, corrected_words)):
                if orig.lower() != corr.lower():
                    errors.append({
                        "message": f"Có thể sai: '{orig}' nên là '{corr}'",
                        "original": orig,
                        "suggestion": corr,
                        "position": i,
                        "rule": {"id": "T5_CORRECTION"}
                    })

            # Nếu không tìm thấy lỗi cụ thể nhưng có sự khác biệt, thêm lỗi chung
            if not errors:
                errors.append({
                    "message": "Văn bản có thể cần được hiệu chỉnh",
                    "original": text,
                    "suggestion": corrected_text,
                    "rule": {"id": "T5_GENERAL_CORRECTION"}
                })

        return errors, corrected_text

    except Exception as e:
        print(f"Error in T5 grammar detection: {e}")
        traceback.print_exc()
        raise

def build_grading_prompt(text: str, errors: list, corrected_text: str):
    """Tạo prompt tiếng Việt cho OpenAI để chấm điểm bài viết."""

    error_description = ""
    if errors:
        error_list = "\n".join([f"- {err['message']}" for err in errors])
        error_description = f"""
Danh sách lỗi được phát hiện:
{error_list}

Văn bản đã sửa: {corrected_text}
"""
    else:
        error_description = "Không phát hiện lỗi ngữ pháp rõ ràng."

    return f"""
Bạn là một hệ thống chấm điểm và nhận xét bài viết tiếng Anh dành cho người học Việt Nam.

Dưới đây là bài viết của học viên:
---
{text}
---

{error_description}

Yêu cầu:
1. Dựa trên các lỗi grammar ở trên (nếu có), hãy chấm điểm bài viết theo thang 0–100.
2. Nhận xét tổng quan về bài viết bằng **tiếng Việt** (không nhận xét lan man, nhận xét đúng trọng tâm).
3. Gợi ý cách cải thiện bằng **tiếng Việt**.
4. Xác định trình độ dựa theo CEFR (A1–C2).
5. Trả về **đúng định dạng JSON**, không thêm chữ nào ngoài JSON.

Format JSON:
{{
  "score": <number>,
  "level": "<A1-C2>",
  "overall_comment": "<Nhận xét tiếng Việt>",
  "suggestions": ["<gợi ý 1>", "<gợi ý 2>"]
}}
"""

def call_openai_for_grading(prompt: str):
    """Gọi OpenAI API để chấm điểm và nhận xét bài viết."""
    if not openai_client:
        raise HTTPException(status_code=500, detail="OpenAI client is not initialized. Check API key.")

    try:
        response = openai_client.chat.completions.create(
            model=OPENAI_MODEL,
            messages=[
                {"role": "system", "content": "Bạn là một giáo viên tiếng Anh chuyên nghiệp, chấm điểm bài viết cho học viên Việt Nam."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.2,
            max_tokens=1000
        )

        return response.choices[0].message.content

    except Exception as e:
        print(f"Error calling OpenAI: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"OpenAI API error: {str(e)}")

# -----------------------------
# Grammar Grading Endpoint
# -----------------------------
@app.post("/api/v1/grade_text")
async def grade_text(payload: GrammarGradeRequest):
    """
    Chấm điểm bài viết tiếng Anh.
    - Sử dụng T5 model để phát hiện lỗi ngữ pháp
    - Sử dụng OpenAI để chấm điểm và đưa ra nhận xét bằng tiếng Việt
    """
    print(f"[Grade] Received text: {payload.text[:100]}...")

    try:
        # Bước 1: Phát hiện lỗi ngữ pháp bằng T5
        errors, corrected_text = detect_grammar_errors_with_t5(payload.text)
        print(f"[Grade] Detected {len(errors)} errors")

        # Bước 2: Tạo prompt cho OpenAI
        prompt = build_grading_prompt(payload.text, errors, corrected_text)

        # Bước 3: Gọi OpenAI để chấm điểm
        openai_output = call_openai_for_grading(prompt)
        print(f"[Grade] OpenAI response: {openai_output[:200]}...")

        # Bước 4: Parse JSON từ OpenAI
        # Làm sạch output (loại bỏ markdown code blocks nếu có)
        cleaned_output = openai_output.strip().replace("```json", "").replace("```", "").strip()

        # Tìm JSON object
        json_match = re.search(r'\{.*\}', cleaned_output, re.DOTALL)
        if not json_match:
            raise ValueError(f"Không tìm thấy JSON trong response: {openai_output[:200]}")

        grading_json = json_match.group(0).strip()
        grading = json.loads(grading_json)

        print(f"[Grade] Parsed grading: score={grading.get('score')}, level={grading.get('level')}")

        # Bước 5: Trả về kết quả
        return {
            "status": "success",
            "original_text": payload.text,
            "grammar_errors": errors,
            "grading": grading
        }

    except json.JSONDecodeError as e:
        print(f"[Grade] JSON parse error: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"OpenAI trả về JSON sai định dạng. Lỗi: {str(e)}"
        )
    except Exception as e:
        print(f"[Grade] Error: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

# -----------------------------
# Speaking Practice Endpoint (STT + Spellcheck)
# -----------------------------
@app.post("/api/v1/speaking-practice")
async def speaking_practice(audio: UploadFile = File(...)):
    """
    Speaking practice endpoint: Transcribe audio and check spelling/grammar.
    - Sử dụng Whisper để chuyển audio thành text
    - Sử dụng T5 để kiểm tra và sửa lỗi chính tả/ngữ pháp
    - Trả về cả text gốc và text đã sửa
    """
    if not whisper_model:
        raise HTTPException(status_code=500, detail="Whisper model is not loaded. Check server logs.")
    
    if not model or not tokenizer:
        raise HTTPException(status_code=500, detail="T5 Model is not loaded. Check server logs.")
    
    print(f"[Speaking Practice] Received audio file: {audio.filename}, content_type: {audio.content_type}")
    
    try:
        # Step 1: Save uploaded audio to temp file
        with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as temp_file:
            content = await audio.read()
            temp_file.write(content)
            temp_path = temp_file.name
        
        print(f"[Speaking Practice] Saved to temp file: {temp_path}")
        
        # Step 2: Transcribe with Whisper
        result = whisper_model.transcribe(
            temp_path,
            language="en",
            fp16=False if DEVICE == "cpu" else True
        )
        
        transcribed_text = result["text"].strip()
        print(f"[Speaking Practice] Transcribed: {transcribed_text}")
        
        # Cleanup temp file
        os.unlink(temp_path)
        
        if not transcribed_text:
            return {
                "status": "success",
                "transcribed_text": "",
                "corrected_text": "",
                "errors": [],
                "has_errors": False
            }
        
        # Step 3: Spellcheck with T5
        input_with_prefix = f"grammar: {transcribed_text}"
        
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
        
        print(f"[Speaking Practice] Corrected: {corrected_text}")
        
        # Step 4: Find differences/errors
        errors = []
        has_errors = transcribed_text.lower().strip() != corrected_text.lower().strip()
        
        if has_errors:
            original_words = transcribed_text.split()
            corrected_words = corrected_text.split()
            
            for i, (orig, corr) in enumerate(zip(original_words, corrected_words)):
                if orig.lower() != corr.lower():
                    errors.append({
                        "original": orig,
                        "corrected": corr,
                        "position": i
                    })
            
            # Handle length differences
            if len(original_words) > len(corrected_words):
                for i in range(len(corrected_words), len(original_words)):
                    errors.append({
                        "original": original_words[i],
                        "corrected": "(removed)",
                        "position": i
                    })
            elif len(corrected_words) > len(original_words):
                for i in range(len(original_words), len(corrected_words)):
                    errors.append({
                        "original": "(missing)",
                        "corrected": corrected_words[i],
                        "position": i
                    })
        
        return {
            "status": "success",
            "transcribed_text": transcribed_text,
            "corrected_text": corrected_text,
            "errors": errors,
            "has_errors": has_errors
        }
        
    except Exception as e:
        print(f"[Speaking Practice] Error: {e}")
        traceback.print_exc()
        # Cleanup temp file if exists
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
        "openai_client_loaded": openai_client is not None,
        "device": DEVICE
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

