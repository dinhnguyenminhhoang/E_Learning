import torch
from transformers import T5Tokenizer, T5ForConditionalGeneration
import json
from tqdm import tqdm
import evaluate
import pandas as pd
from texttable import Texttable
import os
import glob

# ===== CẤU HÌNH =====
# Thư mục cha chứa model (Code sẽ tự mò vào bên trong tìm checkpoint mới nhất)
BASE_MODEL_DIR = "./t5_large_final_model" 
TEST_FILE = "test_data_jfleg.jsonl"
OUTPUT_CSV = "eval_result.csv"
BATCH_SIZE = 16
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
# ====================

def get_latest_checkpoint(base_dir):
    """Tìm checkpoint có số lớn nhất (Mới nhất)"""
    if not os.path.exists(base_dir):
        return None
    
    # Tìm các folder bắt đầu bằng 'checkpoint-'
    checkpoints = glob.glob(os.path.join(base_dir, "checkpoint-*"))
    
    # Nếu không có checkpoint nào, thử xem có phải model final không
    if not checkpoints:
        if os.path.exists(os.path.join(base_dir, "config.json")):
            return base_dir
        return None
    
    # Sắp xếp theo số (checkpoint-500 < checkpoint-1000)
    latest_ckpt = max(checkpoints, key=lambda x: int(x.split("-")[-1]))
    return latest_ckpt

def run_evaluation():
    print("🚀 BẮT ĐẦU ĐÁNH GIÁ TỪ CHECKPOINT...")
    
    # 1. Tìm Checkpoint
    model_path = get_latest_checkpoint(BASE_MODEL_DIR)
    if model_path:
        print(f"✅ Đã tìm thấy Checkpoint mới nhất: {model_path}")
    else:
        print(f"❌ Không tìm thấy model nào trong {BASE_MODEL_DIR}")
        return

    # 2. Load Metrics
    print("⏳ Đang tải bộ chấm điểm (Metrics)...")
    try:
        metric_bleu = evaluate.load("bleu")
        metric_gleu = evaluate.load("google_bleu")
    except:
        print("❌ Lỗi tải metrics. Hãy chạy: pip install evaluate sacrebleu")
        return

    # 3. Load Model & Tokenizer
    print("⏳ Đang tải Model lên GPU...")
    try:
        model = T5ForConditionalGeneration.from_pretrained(model_path).to(DEVICE)
        
        # MẸO: Load Tokenizer gốc để tránh lỗi thiếu file trong checkpoint
        print("   -> Đang load Tokenizer gốc (t5-large)...")
        tokenizer = T5Tokenizer.from_pretrained("t5-large", legacy=False)
        
    except Exception as e:
        print(f"❌ Lỗi load model: {e}")
        return

    model.eval()

    # 4. Load Data Test
    print("⏳ Đang đọc file Test...")
    inputs = []
    targets = []
    try:
        with open(TEST_FILE, 'r', encoding='utf-8') as f:
            for line in f:
                data = json.loads(line)
                inputs.append(data['input_text'])
                targets.append(data['target_text'])
        print(f"   -> Đã nạp {len(inputs)} câu test.")
    except:
        print(f"❌ Không thấy file {TEST_FILE}")
        return

    # 5. Chạy dự đoán (Inference)
    print("⚙️  Đang chạy sửa lỗi (Inference)...")
    predictions = []
    
    # Chạy batch để nhanh hơn
    for i in tqdm(range(0, len(inputs), BATCH_SIZE)):
        batch_src = inputs[i : i+BATCH_SIZE]
        
        encoded = tokenizer(
            batch_src, 
            return_tensors="pt", 
            padding=True, 
            truncation=True, 
            max_length=64
        ).to(DEVICE)
        
        with torch.no_grad():
            outputs = model.generate(
                **encoded, 
                max_length=64, 
                num_beams=2, # Beam search 2 là đủ nhanh và chuẩn
                early_stopping=True
            )
        
        decoded = tokenizer.batch_decode(outputs, skip_special_tokens=True)
        predictions.extend(decoded)

    # 6. Tính điểm
    print("📊 Đang tính toán điểm số...")
    bleu = metric_bleu.compute(predictions=predictions, references=targets)
    gleu = metric_gleu.compute(predictions=predictions, references=targets)
    
    # Tính Exact Match (Tỷ lệ đúng tuyệt đối)
    exact_matches = 0
    for p, t in zip(predictions, targets):
        # Chuẩn hóa nhẹ trước khi so sánh (bỏ khoảng trắng thừa)
        if p.strip() == t.strip():
            exact_matches += 1
            
    exact_score = (exact_matches / len(targets)) * 100

    # 7. In Báo Cáo
    t = Texttable()
    t.add_rows([
        ["CHỈ SỐ (METRIC)", "ĐIỂM SỐ", "Ý NGHĨA"],
        ["BLEU", f"{bleu['bleu']:.4f}", "Độ tương đồng từ ngữ (Càng cao càng tốt)"],
        ["GLEU (Google)", f"{gleu['google_bleu']:.4f}", "Độ trôi chảy & chỉnh sửa (Quan trọng)"],
        ["EXACT MATCH", f"{exact_score:.2f}%", "Tỷ lệ sửa đúng hoàn toàn 100%"]
    ])
    print("\n" + t.draw())

    # 8. Lưu file Excel để soi
    df = pd.DataFrame({
        "Input (Sai)": [s.replace("grammar: ", "") for s in inputs],
        "Target (Chuẩn)": targets,
        "Model Sửa": predictions,
        "Đúng tuyệt đối?": [p.strip() == t.strip() for p, t in zip(predictions, targets)]
    })
    df.to_csv(OUTPUT_CSV, index=False)
    print(f"\n✅ Đã lưu kết quả chi tiết vào: {OUTPUT_CSV}")

if __name__ == "__main__":
    run_evaluation()