import os
import torch
import traceback
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from transformers import T5Tokenizer, T5ForConditionalGeneration

app = FastAPI(
    title="T5 Spell Check API",
    description="API for spell checking using a fine-tuned T5 model.",
    version="1.0.0"
)

# -----------------------------
# CONFIG
# -----------------------------
# Path to the model checkpoint
# Get absolute path to ensure correctness
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "../T5_spellCheck/checkpoint-145000")
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"

print(f"Base Dir: {BASE_DIR}")
print(f"Attempting to load model from: {os.path.abspath(MODEL_PATH)}")
print(f"Device: {DEVICE}")

# Load Model & Tokenizer
try:
    # Try loading tokenizer first
    print("Loading tokenizer...")
    tokenizer = T5Tokenizer.from_pretrained("t5-large", legacy=False)
    
    # Try loading model on DEVICE (CUDA if available)
    print(f"Loading model on {DEVICE}...")
    try:
        model = T5ForConditionalGeneration.from_pretrained(MODEL_PATH).to(DEVICE)
    except torch.OutOfMemoryError:
        print("⚠️ CUDA Out of Memory! Falling back to CPU...")
        DEVICE = "cpu"
        torch.cuda.empty_cache() # Clear GPU memory
        model = T5ForConditionalGeneration.from_pretrained(MODEL_PATH).to(DEVICE)
    except Exception as e:
        print(f"Error loading on {DEVICE}, trying CPU... Error: {e}")
        DEVICE = "cpu"
        model = T5ForConditionalGeneration.from_pretrained(MODEL_PATH).to(DEVICE)

    model.eval()
    print(f"Model loaded successfully on {DEVICE}!")
except Exception as e:
    print(f"CRITICAL ERROR loading model: {e}")
    traceback.print_exc()
    model = None
    tokenizer = None

# -----------------------------
# Request Model
# -----------------------------
class SpellCheckRequest(BaseModel):
    text: str

# -----------------------------
# Endpoint
# -----------------------------
@app.post("/api/v1/correct")
async def correct_text(payload: SpellCheckRequest):
    if not model or not tokenizer:
        print("Request failed: Model or Tokenizer not loaded.")
        raise HTTPException(status_code=500, detail="Model is not loaded. Check server logs for startup errors.")

    input_text = payload.text
    print(f"Received text: {input_text}")
    
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
        
        # Clean up the output if the model repeats the prefix
        if corrected_text.startswith("grammar:"):
            corrected_text = corrected_text.replace("grammar:", "", 1).strip()
            
        print(f"Corrected text: {corrected_text}")
        
        return {
            "status": "success",
            "original_text": input_text,
            "corrected_text": corrected_text
        }

    except Exception as e:
        print(f"Error during inference: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
def health_check():
    return {"status": "ok", "model_loaded": model is not None}
