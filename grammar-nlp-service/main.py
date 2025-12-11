from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import requests
import json
import re

app = FastAPI(
    title="Hybrid Grammar + LLM Scoring (Vietnamese Output)",
    description="LanguageTool + Gemini scoring with Vietnamese explanation.",
    version="1.0.0"
)

# -----------------------------
# CONFIG
# -----------------------------
LANGUAGETOOL_API = "https://api.languagetoolplus.com/v2/check"
GEMINI_MODEL = "gemini-2.5-flash"
GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1" 

# Đây là khóa API của bạn
GEMINI_API_KEY = "AIzaSyBRVOnVsxVabRfdNGJfmcfAVwq8LgrbuJw" 


# -----------------------------
# Request model
# -----------------------------
class TextPayload(BaseModel):
    text: str
    language: str = "en-US"


# -----------------------------
# Step 1. Call LanguageTool
# -----------------------------
def call_languagetool(text: str, lang: str):
    # ... (giữ nguyên code này)
    payload = {
        "text": text,
        "language": lang
    }
    
    response = requests.post(LANGUAGETOOL_API, data=payload)
    response.raise_for_status()
    
    return response.json().get("matches", [])


# -----------------------------
# Step 2. Call Gemini (Sửa lỗi 400)
# -----------------------------
def call_gemini(prompt_text: str):
    # Endpoint cho gemini-2.5-flash là models:generateContent
    url = f"{GEMINI_BASE_URL}/models/{GEMINI_MODEL}:generateContent?key={GEMINI_API_KEY}"

    payload = {
        "contents": [{
            "parts": [{"text": prompt_text}]
        }],
        # SỬA LỖI: Phải dùng 'generationConfig' thay vì 'config'
        "generationConfig": { 
            "temperature": 0.2,
            "maxOutputTokens": 4096 
        }
    }

    response = requests.post(url, json=payload)
    response.raise_for_status()

    try:
        data = response.json()
        return data["candidates"][0]["content"]["parts"][0]["text"]
    except (KeyError, IndexError):
        print(f"Lỗi phân tích cú pháp Gemini: {data}")
        # Thêm thông tin chi tiết lỗi để dễ debug
        raise ValueError(f"Lỗi cấu trúc phản hồi từ Gemini API: {data.get('error', {}).get('message', 'Không rõ')}")


# -----------------------------
# Prompt tiếng Việt (Giữ nguyên)
# -----------------------------
def build_prompt(text: str, error_list: str):
    return f"""
Bạn là một hệ thống chấm điểm và nhận xét bài viết tiếng Anh dành cho người học Việt Nam.

Dưới đây là bài viết của học viên:
---
{text}
---

Dưới đây là danh sách lỗi ngữ pháp/ chính tả được LanguageTool phát hiện:
---
{error_list}
---

Yêu cầu:
1. Dựa trên các lỗi grammar ở trên (bắt buộc), hãy chấm điểm bài viết theo thang 0–100.
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


# -----------------------------
# Endpoint
# -----------------------------
@app.post("/api/v1/grade_text")
def grade_text(payload: TextPayload):
    # Khởi tạo json_string để tránh UnboundLocalError trong khối except
    json_string = "" 
    gemini_output_raw = ""

    try:
        # 1. Grammar lỗi (Giữ nguyên)
        matches = call_languagetool(payload.text, payload.language)

        error_list = "\n".join(
            [f"- {m['message']} (rule: {m['rule']['id']})" for m in matches]
        )

        # 2. LLM Scoring
        prompt = build_prompt(payload.text, error_list)
        gemini_output_raw = call_gemini(prompt)

        # -----------------------------
        # SỬA LỖI: Làm sạch JSON triệt để hơn
        # -----------------------------
        
        # 1. Loại bỏ các code block markdown và khoảng trắng/xuống dòng thừa
        # SỬA LỖI: Loại bỏ ký tự không phải JSON và markdown
        cleaned_output = gemini_output_raw.strip().replace("```json", "").replace("```", "").strip()

        # 2. Tìm khối JSON đầu tiên nằm giữa { và }
        # re.DOTALL: cho phép . khớp với ký tự xuống dòng
        # re.IGNORECASE: bỏ qua chữ hoa/thường (cho trường hợp ```JSON)
        # SỬA LỖI: Chỉ tìm cặp ngoặc nhọn đầu tiên/cuối cùng
        json_match = re.search(r'\{.*\}', cleaned_output, re.DOTALL)
        
        if not json_match:
            # Nếu không tìm thấy, raise lỗi để bắt vào khối except
            raise json.JSONDecodeError("Không tìm thấy khối JSON hợp lệ", gemini_output_raw, 0)
            
        json_string = json_match.group(0).strip()
        
        # 3. Chuyển về JSON
        grading = json.loads(json_string)

        return {
            "status": "success",
            "original_text": payload.text,
            "grammar_errors": matches,
            "grading": grading
        }

    except json.JSONDecodeError as e:
        # Lỗi xảy ra trong quá trình json.loads
        print(f"JSON Decode Error: {e}")
        # In chuỗi JSON bị lỗi để debug
        print(f"JSON string being parsed (Truncated): {json_string[:200]}...") 
        
        # Trả về HTTPException
        raise HTTPException(
            status_code=500,
            detail=f"Gemini trả về JSON sai định dạng. Lỗi: {str(e)}. Output gốc (100 ký tự): {gemini_output_raw[:100]}"
        )
    except Exception as e:
        # Bắt các lỗi khác (ví dụ: lỗi gọi API Gemini/LanguageTool)
        raise HTTPException(status_code=500, detail=str(e))