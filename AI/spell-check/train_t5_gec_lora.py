import os
import torch
from datasets import load_dataset
from transformers import (AutoTokenizer, AutoModelForSeq2SeqLM,
                          DataCollatorForSeq2Seq, TrainingArguments, Trainer)
from peft import LoraConfig, get_peft_model, prepare_model_for_kbit_training

MODEL_ID = "google/flan-t5-small"

# ===== 1) Load data =====
data_files = {
    "train": "train_all_plus_spelling.jsonl.gz",
    "dev":   "noisy_clean/clang8_dev10k.jsonl.gz"
}
ds = load_dataset("json", data_files=data_files)

# ===== 2) Tokenizer =====
tok = AutoTokenizer.from_pretrained(MODEL_ID, use_fast=True)

# ===== 3) Tiền xử lý =====
MAX_LEN = 128
PREFIX = "fix: "

def preprocess(ex):
    src = PREFIX + ex["noisy"]
    tgt = ex["clean"]
    model_inp = tok(src, max_length=MAX_LEN, truncation=True)
    labels = tok(tgt, max_length=MAX_LEN, truncation=True)
    model_inp["labels"] = labels["input_ids"]
    return model_inp

ds_proc = {}
for split in ds:
    ds_proc[split] = ds[split].map(preprocess, remove_columns=ds[split].column_names)

# ===== 4) Load model với 8-bit  =====
model = AutoModelForSeq2SeqLM.from_pretrained(
    MODEL_ID,
    load_in_8bit=True,
    device_map="auto",
    torch_dtype=torch.float32,  # QUAN TRỌNG
)

model = prepare_model_for_kbit_training(model, use_gradient_checkpointing=True)

peft_cfg = LoraConfig(
    r=8,                 
    lora_alpha=16,          
    lora_dropout=0.1,    
    target_modules=["q", "v"], 
    bias="none",
    task_type="SEQ_2_SEQ_LM"
)
model = get_peft_model(model, peft_cfg)
model.print_trainable_parameters()

collator = DataCollatorForSeq2Seq(tok, model=model)

# ===== 6) TrainingArguments - LAPTOP OPTIMIZATION =====
args = TrainingArguments(
    output_dir="checkpoints-t5-laptop",
    eval_strategy="steps",
    save_strategy="steps",
    save_steps=2000,   
    eval_steps=2000,
    logging_steps=50,
    
    learning_rate=3e-5,    
    
    per_device_train_batch_size=4,      
    per_device_eval_batch_size=4,
    gradient_accumulation_steps=4,      
    
    num_train_epochs=3,
    weight_decay=0.01,
    save_total_limit=2,    
    report_to="none",
    
    max_grad_norm=0.1,    
    
    fp16=False,
    bf16=False,
    
    warmup_ratio=0.1,       
    lr_scheduler_type="cosine",
    
    gradient_checkpointing=True,
    
    optim="adamw_torch",  
    dataloader_num_workers=2, 
    dataloader_pin_memory=False, 
    
    logging_first_step=True,
    logging_nan_inf_filter=False,
)

# ===== 7) Trainer =====
trainer = Trainer(
    model=model,
    args=args,
    train_dataset=ds_proc["train"],
    eval_dataset=ds_proc["dev"],
    data_collator=collator,
    processing_class=tok,
)

# ===== 8) Training =====
print("🚀 Training với config tối ưu cho laptop gaming")
print(f"📊 Effective batch size: {args.per_device_train_batch_size * args.gradient_accumulation_steps}")
print(f"📉 Learning rate: {args.learning_rate}")
print(f"🎯 Max grad norm: {args.max_grad_norm}")

trainer.train(resume_from_checkpoint="checkpoints-t5-laptop/checkpoint-164000")

trainer.save_model("t5_gec_lora/final")
tok.save_pretrained("t5_gec_lora/final")
print("✅ Training completed!")