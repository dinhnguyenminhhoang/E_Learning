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
    version="2.1.0" # Version updated
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
# Điều chỉnh path này theo cấu trúc folder thực tế của bạn nếu cần
MODEL_PATH = os.path.join(BASE_DIR, "../T5_spellCheck/checkpoint-145000") 
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
WHISPER_MODEL_SIZE = os.getenv("WHISPER_MODEL_SIZE", "base")

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
    except (torch.OutOfMemoryError, Exception) as e:
        print(f"⚠️ GPU Error ({e}). Falling back to CPU for T5...")
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

# -----------------------------
# Utility Functions
# -----------------------------
def calculate_similarity(text1: str, text2: str) -> float:
    text1 = text1.lower().strip()
    text2 = text2.lower().strip()
    if not text1 or not text2: return 0.0
    ratio = SequenceMatcher(None, text1, text2).ratio()
    return round(ratio * 100, 1)

def normalize_text(text: str) -> str:
    text = re.sub(r'[^\w\s]', '', text)
    text = re.sub(r'\s+', ' ', text)
    return text.lower().strip()

# -----------------------------
# Grammar Logic
# -----------------------------
def detect_grammar_errors_optimized(original_text: str):
    """
    Sử dụng T5 để sửa lỗi, sau đó dùng difflib để so sánh thông minh.
    Khắc phục lỗi lệch index của thuật toán cũ.
    """
    if not model or not tokenizer:
        raise HTTPException(status_code=500, detail="T5 Model is not loaded.")

    # 1. T5 Inference
    input_with_prefix = f"grammar: {original_text}"
    try:
        encoded = tokenizer([input_with_prefix], return_tensors="pt", padding=True, truncation=True, max_length=128).to(DEVICE)
        with torch.no_grad():
            outputs = model.generate(**encoded, max_length=128, num_beams=2, early_stopping=True)
        corrected_text = tokenizer.decode(outputs[0], skip_special_tokens=True)
        if corrected_text.startswith("grammar:"):
            corrected_text = corrected_text.replace("grammar:", "", 1).strip()
    except Exception as e:
        print(f"T5 Inference Error: {e}")
        return [], ""

    # 2. Diff Logic (Improved)
    def tokenize(text):
        return re.findall(r"\w+|[^\w\s]", text, re.UNICODE)

    original_tokens = tokenize(original_text)
    corrected_tokens = tokenize(corrected_text)

    matcher = SequenceMatcher(None, original_tokens, corrected_tokens)
    errors = []

    for tag, i1, i2, j1, j2 in matcher.get_opcodes():
        orig_fragment = " ".join(original_tokens[i1:i2])
        corr_fragment = " ".join(corrected_tokens[j1:j2])

        if tag == 'replace':
            errors.append({
                "message": f"Dùng từ chưa chính xác: '{orig_fragment}' nên là '{corr_fragment}'",
                "original": orig_fragment,
                "suggestion": corr_fragment,
                "type": "grammar/spelling",
                "rule": {"id": "T5_CORRECTION"}
            })
        elif tag == 'delete':
            errors.append({
                "message": f"Từ thừa: Nên bỏ '{orig_fragment}'",
                "original": orig_fragment,
                "suggestion": "",
                "type": "excess_word",
                "rule": {"id": "T5_DELETION"}
            })
        elif tag == 'insert':
            prev_word = original_tokens[i1-1] if i1 > 0 else "đầu câu"
            errors.append({
                "message": f"Thiếu từ: Cần thêm '{corr_fragment}' sau '{prev_word}'",
                "original": "",
                "suggestion": corr_fragment,
                "type": "missing_word",
                "rule": {"id": "T5_INSERTION"}
            })

    return errors, corrected_text

def build_grading_prompt(text: str, errors: list):
    """Tạo prompt tiếng Việt, yêu cầu output JSON chuẩn."""
    error_list_str = "\n".join([f"- {err['message']}" for err in errors]) if errors else "Không phát hiện lỗi ngữ pháp rõ ràng."

    return f"""
Bạn là một hệ thống chấm điểm và nhận xét bài viết tiếng Anh dành cho người học Việt Nam.

Dưới đây là bài viết của học viên:
---
{text}
---

Dưới đây là các lỗi ngữ pháp hệ thống tự động phát hiện:
---
{error_list_str}
---

Yêu cầu:
1. Dựa trên các lỗi grammar ở trên (bắt buộc xem xét), hãy chấm điểm bài viết theo thang 0–100.
2. Nhận xét tổng quan về bài viết bằng **tiếng Việt** (nhận xét mang tính xây dựng, ngắn gọn).
3. Gợi ý cách cải thiện bằng **tiếng Việt**.
4. Xác định trình độ dựa theo CEFR (A1–C2).
5. Trả về **DUY NHẤT một chuỗi JSON hợp lệ**, không có markdown code block (```json).

Format JSON output:
{{
  "score": <number>,
  "level": "<A1-C2>",
  "overall_comment": "<Nhận xét tiếng Việt>",
  "suggestions": ["<gợi ý 1>", "<gợi ý 2>"]
}}
"""

# -----------------------------
# Endpoints
# -----------------------------

# --- 1. T5 Spell Check ---
@app.post("/api/v1/correct")
async def correct_text(payload: SpellCheckRequest):
    # Endpoint này dùng logic mới luôn để chính xác hơn
    try:
        errors, corrected_text = detect_grammar_errors_optimized(payload.text)
        return {
            "status": "success",
            "original_text": payload.text,
            "corrected_text": corrected_text,
            "errors": errors # Trả về list lỗi chi tiết hơn
        }
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

# --- 2. Whisper Transcribe ---
@app.post("/api/v1/transcribe")
async def transcribe_audio(audio: UploadFile = File(...)):
    if not whisper_model: raise HTTPException(status_code=500, detail="Whisper model not loaded.")
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as temp_file:
            content = await audio.read()
            temp_file.write(content)
            temp_path = temp_file.name
        
        result = whisper_model.transcribe(temp_path, language="en", fp16=False if DEVICE == "cpu" else True)
        os.unlink(temp_path)
        
        return {"status": "success", "transcribed_text": result["text"].strip()}
    except Exception as e:
        if 'temp_path' in locals() and os.path.exists(temp_path): os.unlink(temp_path)
        raise HTTPException(status_code=500, detail=str(e))

# --- 3. Whisper Compare ---
@app.post("/api/v1/transcribe-and-compare")
async def transcribe_and_compare(audio: UploadFile = File(...), target_word: str = Form(...)):
    if not whisper_model: raise HTTPException(status_code=500, detail="Whisper model not loaded.")
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as temp_file:
            content = await audio.read()
            temp_file.write(content)
            temp_path = temp_file.name
        
        result = whisper_model.transcribe(temp_path, language="en", fp16=False if DEVICE == "cpu" else True)
        os.unlink(temp_path)
        
        transcribed_text = result["text"].strip()
        acc = calculate_similarity(normalize_text(transcribed_text), normalize_text(target_word))
        
        return {
            "status": "success",
            "transcribed_text": transcribed_text,
            "target_word": target_word,
            "accuracy": acc,
            "is_correct": acc >= 80.0
        }
    except Exception as e:
        if 'temp_path' in locals() and os.path.exists(temp_path): os.unlink(temp_path)
        raise HTTPException(status_code=500, detail=str(e))

# --- 4. Grade Text (Updated Logic) ---
@app.post("/api/v1/grade_text")
async def grade_text(payload: GrammarGradeRequest):
    print(f"[Grade] Processing: {payload.text[:50]}...")
    json_string = ""
    openai_output_raw = ""

    try:
        # Bước 1: Detect grammar errors (Dùng T5)
        errors, corrected_text = detect_grammar_errors_optimized(payload.text)

        # Bước 2: Build prompt
        prompt = build_grading_prompt(payload.text, errors)

        # Bước 3: Call OpenAI
        if not openai_client:
            raise HTTPException(status_code=503, detail="OpenAI API key not configured")

        response = openai_client.chat.completions.create(
            model=OPENAI_MODEL,
            messages=[
                {"role": "system", "content": "You are a helpful English tutor."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.2
        )
        openai_output_raw = response.choices[0].message.content

        # Bước 4: Clean & Parse JSON (Logic từ ví dụ của bạn)
        cleaned_output = openai_output_raw.strip().replace("```json", "").replace("```", "").strip()
        json_match = re.search(r'\{.*\}', cleaned_output, re.DOTALL)
        
        if not json_match:
             # Fallback: Nếu không tìm thấy {}, thử parse trực tiếp phòng khi model trả về raw text không ngoặc
            raise ValueError("No JSON block found in response")

        json_string = json_match.group(0).strip()
        grading = json.loads(json_string)

        return {
            "status": "success",
            "original_text": payload.text,
            "corrected_text": corrected_text, # Trả thêm cái này để frontend biết T5 sửa gì
            "grammar_errors": errors,
            "grading": grading
        }

    except json.JSONDecodeError as e:
        print(f"JSON Error: {e}")
        print(f"Raw Output: {openai_output_raw}")
        raise HTTPException(status_code=500, detail=f"AI returned invalid JSON: {str(e)}")
    except Exception as e:
        print(f"General Error: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

# --- 5. Speaking Practice (Updated Logic) ---
@app.post("/api/v1/speaking-practice")
async def speaking_practice(audio: UploadFile = File(...)):
    if not whisper_model or not model:
        raise HTTPException(status_code=500, detail="Models not loaded.")
    
    temp_path = None
    try:
        # 1. Save audio
        with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as temp_file:
            temp_file.write(await audio.read())
            temp_path = temp_file.name

        # 2. Whisper
        result = whisper_model.transcribe(temp_path, language="en", fp16=False if DEVICE == "cpu" else True)
        transcribed_text = result["text"].strip()
        
        if not transcribed_text:
            os.unlink(temp_path)
            return {"status": "success", "transcribed_text": "", "errors": [], "has_errors": False}

        # 3. T5 Check (Dùng hàm mới detect_grammar_errors_optimized)
        errors, corrected_text = detect_grammar_errors_optimized(transcribed_text)

        os.unlink(temp_path)
        return {
            "status": "success",
            "transcribed_text": transcribed_text,
            "corrected_text": corrected_text,
            "errors": errors,
            "has_errors": len(errors) > 0
        }

    except Exception as e:
        if temp_path and os.path.exists(temp_path): os.unlink(temp_path)
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "t5_loaded": model is not None,
        "whisper_loaded": whisper_model is not None,
        "openai_loaded": openai_client is not None,
        "device": DEVICE
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)