import os
import torch
import json
import gzip
from datasets import Dataset
from transformers import (AutoTokenizer, AutoModelForSeq2SeqLM,
                          DataCollatorForSeq2Seq, TrainingArguments, Trainer)
from peft import LoraConfig, get_peft_model, prepare_model_for_kbit_training

# ===== CONFIG =====
MODEL_ID = "google/byt5-small"  # Character-level T5
DATA_FILE = "word_spelling_train.jsonl.gz"
OUTPUT_DIR = "checkpoints-byt5-spell"

print("="*80)
print("TRAIN ByT5 WORD-LEVEL SPELL CHECKER")
print("="*80 + "\n")

# ===== 1) LOAD DATA =====
print(f"📖 Loading data from {DATA_FILE}...\n")

with gzip.open(DATA_FILE, 'rt', encoding='utf-8') as f:
    data = [json.loads(line) for line in f]

print(f"✅ Loaded {len(data):,} word pairs\n")

# Sample data
print("📝 Sample data:")
for item in data[:5]:
    print(f"   {item['noisy']:15s} → {item['clean']}")
print()

# Convert to Dataset
ds = Dataset.from_list(data)

# Train/Dev split
ds = ds.train_test_split(test_size=0.05, seed=42)
print(f"📊 Train: {len(ds['train']):,} | Dev: {len(ds['test']):,}\n")

# ===== 2) TOKENIZER =====
print("="*80)
print("TOKENIZER")
print("="*80 + "\n")

tok = AutoTokenizer.from_pretrained(MODEL_ID, use_fast=True)

# ByT5 tokenizes at byte level, no special handling needed
MAX_LEN = 64  # Shorter for words

PREFIX = "fix spelling: "

def preprocess(ex):
    src = PREFIX + ex["noisy"]
    tgt = ex["clean"]
    
    model_inp = tok(src, max_length=MAX_LEN, truncation=True)
    labels = tok(tgt, max_length=MAX_LEN, truncation=True)
    model_inp["labels"] = labels["input_ids"]
    
    return model_inp

print("🔄 Preprocessing...")
ds_train = ds['train'].map(preprocess, remove_columns=ds['train'].column_names)
ds_dev = ds['test'].map(preprocess, remove_columns=ds['test'].column_names)
print("✅ Preprocessing done!\n")

# ===== 3) LOAD MODEL =====
print("="*80)
print("LOAD MODEL")
print("="*80 + "\n")

print(f"📥 Loading {MODEL_ID}...\n")

model = AutoModelForSeq2SeqLM.from_pretrained(
    MODEL_ID,
    load_in_8bit=True,
    device_map="auto",
    torch_dtype=torch.float32,
)

model = prepare_model_for_kbit_training(model, use_gradient_checkpointing=True)

# LoRA config
peft_cfg = LoraConfig(
    r=16,
    lora_alpha=32,
    lora_dropout=0.05,
    target_modules=["q", "v", "k", "o", "wi", "wo"],
    bias="none",
    task_type="SEQ_2_SEQ_LM"
)
model = get_peft_model(model, peft_cfg)
model.print_trainable_parameters()

collator = DataCollatorForSeq2Seq(tok, model=model)

# ===== 4) TRAINING ARGUMENTS =====
print("\n" + "="*80)
print("TRAINING CONFIGURATION")
print("="*80 + "\n")

args = TrainingArguments(
    output_dir=OUTPUT_DIR,
    eval_strategy="steps",
    save_strategy="steps",
    save_steps=1000,
    eval_steps=1000,
    logging_steps=100,
    
    learning_rate=3e-4,
    
    per_device_train_batch_size=16,
    per_device_eval_batch_size=16,
    gradient_accumulation_steps=2,
    
    num_train_epochs=3,
    weight_decay=0.01,
    save_total_limit=3,
    report_to="none",
    
    max_grad_norm=1.0,
    
    fp16=True,
    
    warmup_steps=500,
    lr_scheduler_type="cosine",
    gradient_checkpointing=True,
    
    logging_first_step=True,
)

print("📋 Training config:")
print(f"   Learning rate: {args.learning_rate}")
print(f"   Batch size: {args.per_device_train_batch_size}")
print(f"   Gradient accumulation: {args.gradient_accumulation_steps}")
print(f"   Effective batch size: {args.per_device_train_batch_size * args.gradient_accumulation_steps}")
print(f"   Epochs: {args.num_train_epochs}")
print(f"   Total steps: ~{len(ds_train) * args.num_train_epochs // (args.per_device_train_batch_size * args.gradient_accumulation_steps):,}")
print()

# Estimate time
steps_per_sec = 2  # Conservative estimate
total_steps = len(ds_train) * args.num_train_epochs // (args.per_device_train_batch_size * args.gradient_accumulation_steps)
hours = total_steps / steps_per_sec / 3600
print(f"⏱️  Ước tính thời gian: ~{hours:.1f} giờ\n")

# ===== 5) TRAINER =====
trainer = Trainer(
    model=model,
    args=args,
    train_dataset=ds_train,
    eval_dataset=ds_dev,
    data_collator=collator,
    processing_class=tok,
)

# ===== 6) TRAINING =====
print("="*80)
print("BẮT ĐẦU TRAINING")
print("="*80 + "\n")

trainer.train()

# ===== 7) SAVE =====
print("\n" + "="*80)
print("SAVE MODEL")
print("="*80 + "\n")

output_model_dir = "byt5_word_spell_checker/final"
trainer.save_model(output_model_dir)
tok.save_pretrained(output_model_dir)

print(f"✅ Model saved to: {output_model_dir}\n")

# ===== 8) QUICK TEST =====
print("="*80)
print("QUICK TEST")
print("="*80 + "\n")

test_words = ["lve", "yuo", "helo", "programing", "recieve", "teh", "adn"]

print("Testing spell checker:\n")
for word in test_words:
    inputs = tok(PREFIX + word, return_tensors="pt", max_length=MAX_LEN)
    
    with torch.no_grad():
        outputs = model.generate(**inputs, max_length=MAX_LEN, num_beams=4)
    
    corrected = tok.decode(outputs[0], skip_special_tokens=True)
    print(f"   {word:15s} → {corrected}")

print("\n" + "="*80)
print("HOÀN THÀNH!")
print("="*80)
print(f"\n📂 Model: {output_model_dir}")
print(f"\n🚀 Bước tiếp theo:")
print(f"   python infer_full_pipeline.py")