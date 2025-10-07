import gzip, json, random

FILE_SENT = "train_all.jsonl.gz"           # câu noisy → clean
FILE_WORD = "word_spelling_train_v2.jsonl.gz" # từ đơn noisy → clean
OUT_FILE  = "train_all_plus_spelling.jsonl.gz"

# tỉ lệ mix: 70% sentence, 30% word-level (bạn có thể chỉnh lại)
MIX_RATIO = 0.3  

def read_jsonl_gz(path, limit=None):
    data = []
    with gzip.open(path, "rt", encoding="utf-8") as f:
        for i, line in enumerate(f):
            if limit and i >= limit: break
            try:
                data.append(json.loads(line))
            except:
                continue
    return data

print("📥 Loading datasets...")
sent_data = read_jsonl_gz(FILE_SENT)
word_data = read_jsonl_gz(FILE_WORD)

print(f"  Sentence data: {len(sent_data)}")
print(f"  Word data: {len(word_data)}")

# Xác định số lượng word samples sẽ lấy
num_word = int(len(sent_data) * MIX_RATIO)
if num_word > len(word_data):
    num_word = len(word_data)

word_sample = random.sample(word_data, num_word)

# Gộp lại
merged = sent_data + word_sample
random.shuffle(merged)

# Ghi ra file
with gzip.open(OUT_FILE, "wt", encoding="utf-8") as out:
    for ex in merged:
        out.write(json.dumps(ex, ensure_ascii=False) + "\n")

print(f"✅ Saved merged dataset: {OUT_FILE}")
print(f"   Total samples: {len(merged)}")
