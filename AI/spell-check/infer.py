import torch
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
from peft import PeftModel

# ===== CẤU HÌNH =====
BASE_MODEL = "google/flan-t5-small"  # model gốc
LORA_PATH = "checkpoints-t5-laptop/checkpoint-166000"      # đường dẫn đến adapter đã train
PREFIX = "fix: "                     # prefix giống lúc train
MAX_LEN = 128

# ===== LOAD MODEL & TOKENIZER =====
print("🔄 Loading model...")
tokenizer = AutoTokenizer.from_pretrained(LORA_PATH)

# Load base model
base_model = AutoModelForSeq2SeqLM.from_pretrained(
    BASE_MODEL,
    torch_dtype=torch.float16,
    device_map="auto"
)

# Load LoRA adapter
model = PeftModel.from_pretrained(base_model, LORA_PATH)
model.eval()
print("✅ Model loaded!\n")

# ===== HÀM INFERENCE =====
def correct_text(text, num_beams=4, max_length=MAX_LEN):
    """
    Sửa lỗi chính tả/ngữ pháp cho text đầu vào
    
    Args:
        text: câu cần sửa
        num_beams: số beam cho beam search (càng cao càng chính xác nhưng chậm)
        max_length: độ dài tối đa output
    
    Returns:
        câu đã được sửa
    """
    # Thêm prefix
    input_text = PREFIX + text
    
    # Tokenize
    inputs = tokenizer(
        input_text,
        max_length=max_length,
        truncation=True,
        return_tensors="pt"
    ).to(model.device)
    
    # Generate
    with torch.no_grad():
        outputs = model.generate(
            **inputs,
            max_length=max_length,
            num_beams=num_beams,
            early_stopping=True,
            do_sample=False  # deterministic để kết quả ổn định
        )
    
    # Decode
    corrected = tokenizer.decode(outputs[0], skip_special_tokens=True)
    return corrected

# ===== HÀM INFERENCE BATCH =====
def correct_batch(texts, batch_size=16, num_beams=4, max_length=MAX_LEN):
    """
    Sửa nhiều câu cùng lúc (nhanh hơn)
    
    Args:
        texts: list các câu cần sửa
        batch_size: số câu xử lý mỗi lần
        num_beams: số beam cho beam search
        max_length: độ dài tối đa output
    
    Returns:
        list các câu đã sửa
    """
    results = []
    
    for i in range(0, len(texts), batch_size):
        batch = texts[i:i + batch_size]
        input_texts = [PREFIX + text for text in batch]
        
        # Tokenize batch
        inputs = tokenizer(
            input_texts,
            max_length=max_length,
            truncation=True,
            padding=True,
            return_tensors="pt"
        ).to(model.device)
        
        # Generate
        with torch.no_grad():
            outputs = model.generate(
                **inputs,
                max_length=max_length,
                num_beams=num_beams,
                early_stopping=True,
                do_sample=False
            )
        
        # Decode
        corrected = tokenizer.batch_decode(outputs, skip_special_tokens=True)
        results.extend(corrected)
    
    return results

# ===== DEMO =====
if __name__ == "__main__":
    # Test với 1 câu
    test_sentences = [
        "I has a cat and two dog .",
        "She dont like apple .",
        "They was going to the store yesterday .",
        "He can plays guitar very good .",
    ]
    
    print("=" * 60)
    print("SINGLE SENTENCE INFERENCE")
    print("=" * 60)
    
    for sent in test_sentences:
        corrected = correct_text(sent, num_beams=4)
        print(f"Input:  {sent}")
        print(f"Output: {corrected}")
        print("-" * 60)
    
    print("\n" + "=" * 60)
    print("BATCH INFERENCE (faster for multiple sentences)")
    print("=" * 60)
    
    corrected_batch = correct_batch(test_sentences, batch_size=4, num_beams=4)
    for orig, corr in zip(test_sentences, corrected_batch):
        print(f"Input:  {orig}")
        print(f"Output: {corr}")
        print("-" * 60)
    
    # Interactive mode
    print("\n" + "=" * 60)
    print("INTERACTIVE MODE (type 'quit' to exit)")
    print("=" * 60)
    
    while True:
        text = input("\nEnter text to correct: ").strip()
        if text.lower() == 'quit':
            break
        if text:
            corrected = correct_text(text)
            print(f"✅ Corrected: {corrected}")