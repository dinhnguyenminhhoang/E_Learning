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
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o")

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
        if DEVICE == "cuda":
            torch.cuda.empty_cache()
            
        encoded = tokenizer([input_with_prefix], return_tensors="pt", padding=True, truncation=True, max_length=128).to(DEVICE)
        with torch.no_grad():
            outputs = model.generate(**encoded, max_length=128, num_beams=2, early_stopping=True)
        corrected_text = tokenizer.decode(outputs[0], skip_special_tokens=True)
        if corrected_text.startswith("grammar:"):
            corrected_text = corrected_text.replace("grammar:", "", 1).strip()
    except Exception as e:
        print(f"T5 Inference Error: {e}")
        return [], original_text

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


def build_speaking_grading_prompt(transcribed_text: str, target_text: str, accuracy: float):
    """Tạo prompt cho ChatGPT để chấm điểm bài nói."""
    return f"""
Bạn là một giáo viên tiếng Anh chuyên nghiệp, đang chấm điểm bài luyện nói cho học viên Việt Nam.

**Câu mục tiêu (Target):** {target_text}
**Học viên đã nói (Transcribed):** {transcribed_text}
**Độ chính xác so với câu mục tiêu:** {accuracy}%

QUAN TRỌNG - Quy tắc chấm điểm:
- Nếu accuracy = 100% (nói ĐÚNG hoàn toàn): score PHẢI từ 90-100
- Nếu accuracy >= 80%: score PHẢI từ 70-89
- Nếu accuracy >= 50%: score từ 40-69
- Nếu accuracy < 50%: score từ 0-39

Yêu cầu:
1. Tính điểm tổng (score) dựa trên quy tắc trên
2. pronunciation_score = {min(100, accuracy + 10)} (vì đã nhận diện được đúng từ)
3. accuracy_score = {accuracy}
4. Đưa ra nhận xét bằng tiếng Việt
5. Xác định trình độ CEFR (A1–C2) dựa trên độ khó của câu và điểm số
6. Trả về **CHỈ** JSON, không có text nào khác

JSON (ví dụ với accuracy 100%):
{{
  "score": 95,
  "pronunciation_score": 100,
  "accuracy_score": 100,
  "level": "B1",
  "strengths": ["Phát âm chính xác", "Nói đúng câu mục tiêu"],
  "weaknesses": [],
  "suggestions": ["Tiếp tục luyện tập với câu khó hơn"],
  "overall_comment": "Tuyệt vời! Bạn đã nói đúng hoàn toàn."
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
                {"role": "system", "content": "You are a helpful English tutor."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.2
        )
        openai_output_raw = response.choices[0].message.content

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
        errors, corrected_text = detect_grammar_errors_optimized(payload.text)
        print(f"[Grade] Detected {len(errors)} errors")

        # Bước 2: Tạo prompt cho OpenAI
        prompt = build_grading_prompt(payload.text, errors)

        # Bước 3: Gọi OpenAI để chấm điểm
        openai_output = call_openai_for_grading(prompt)
        print(f"[Grade] OpenAI response: {openai_output[:200]}...")

        # Bước 4: Parse JSON từ OpenAI
        # Làm sạch output (loại bỏ markdown code blocks nếu có)
        cleaned_output = openai_output.strip().replace("```json", "").replace("```", "").strip()

        # Tìm JSON object
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
async def speaking_practice(
    audio: UploadFile = File(...),
    target_text: str = Form(None)
):
    """
    Speaking practice endpoint: Transcribe audio and compare with target text.
    - Sử dụng Whisper để chuyển audio thành text
    - So sánh với target_text để kiểm tra độ chính xác
    - Nếu không có target_text, kiểm tra lỗi ngữ pháp bằng T5
    """
    if not whisper_model:
        raise HTTPException(status_code=500, detail="Whisper model is not loaded. Check server logs.")
    
    print(f"[Speaking Practice] Received audio file: {audio.filename}, content_type: {audio.content_type}")
    print(f"[Speaking Practice] Target text: {target_text}")
    
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
            return {
                "status": "success",
                "transcribed_text": "",
                "corrected_text": target_text or "",
                "errors": [],
                "has_errors": False,
                "accuracy": 0,
                "is_correct": False
            }
        
        # Step 3: Compare with target text if provided
        if target_text:
            # Normalize both texts for comparison
            normalized_transcription = normalize_text(transcribed_text)
            normalized_target = normalize_text(target_text)
            
            # Calculate accuracy
            accuracy = calculate_similarity(normalized_transcription, normalized_target)
            
            print(f"[Speaking Practice] Comparing: '{normalized_transcription}' vs '{normalized_target}'")
            print(f"[Speaking Practice] Accuracy: {accuracy}%")
            
            # Use ChatGPT for detailed grading
            if openai_client:
                try:
                    prompt = build_speaking_grading_prompt(transcribed_text, target_text, accuracy)
                    openai_output = call_openai_for_grading(prompt)
                    print(f"[Speaking Practice] OpenAI response: {openai_output[:200]}...")
                    
                    # Parse JSON from OpenAI
                    cleaned_output = openai_output.strip().replace("```json", "").replace("```", "").strip()
                    json_match = re.search(r'\{.*\}', cleaned_output, re.DOTALL)
                    
                    if json_match:
                        grading = json.loads(json_match.group(0))
                        print(f"[Speaking Practice] Grading: score={grading.get('score')}, level={grading.get('level')}")
                        
                        return {
                            "status": "success",
                            "transcribed_text": transcribed_text,
                            "target_text": target_text,
                            "accuracy": accuracy,
                            "grading": grading
                        }
                except Exception as e:
                    print(f"[Speaking Practice] ChatGPT grading error: {e}")
                    traceback.print_exc()
            
            # Fallback if ChatGPT fails: return basic comparison result
            is_correct = accuracy >= 80.0
            
            # Calculate fallback score based on accuracy
            if accuracy >= 95:
                fallback_score = 95
            elif accuracy >= 80:
                fallback_score = int(70 + (accuracy - 80) * 1.25)  # 70-95
            elif accuracy >= 50:
                fallback_score = int(40 + (accuracy - 50) * 1.0)   # 40-70
            else:
                fallback_score = int(accuracy * 0.8)  # 0-40
            
            return {
                "status": "success",
                "transcribed_text": transcribed_text,
                "target_text": target_text,
                "accuracy": accuracy,
                "grading": {
                    "score": fallback_score,
                    "pronunciation_score": min(100, int(accuracy) + 10),
                    "accuracy_score": int(accuracy),
                    "level": "A1" if accuracy < 50 else "A2" if accuracy < 80 else "B1",
                    "strengths": ["Phát âm đúng câu mục tiêu"] if is_correct else ["Đã hoàn thành bài tập"],
                    "weaknesses": [] if is_correct else ["Cần cải thiện độ chính xác"],
                    "suggestions": ["Tiếp tục luyện tập với câu khó hơn"] if is_correct else ["Lắng nghe kỹ câu mẫu trước khi nói"],
                    "overall_comment": f"Độ chính xác: {accuracy}%. " + ("Tuyệt vời! Bạn đã nói đúng." if is_correct else "Hãy cố gắng nói đúng câu mục tiêu.")
                }
            }
        
        # Fallback: No target text, use T5 for grammar check
        if not model or not tokenizer:
            return {
                "status": "success",
                "transcribed_text": transcribed_text,
                "corrected_text": transcribed_text,
                "errors": [],
                "has_errors": False
            }
        
        input_with_prefix = f"grammar: {transcribed_text}"
        
        encoded = tokenizer(
            [input_with_prefix],
            return_tensors="pt",
            padding=True,
            truncation=True,
            max_length=128
        ).to(DEVICE)

        # 3. T5 Check (Dùng hàm mới detect_grammar_errors_optimized)
        errors, corrected_text = detect_grammar_errors_optimized(transcribed_text)
        
        print(f"[Speaking Practice] Corrected: {corrected_text}")
        
        # Find differences/errors
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