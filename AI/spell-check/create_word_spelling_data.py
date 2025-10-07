import json
import gzip
import random
import re
from pathlib import Path
from collections import Counter


WIKI_DICT_FILE = "processed_data/wiki_dictionary.txt"
OUTPUT_FILE    = "word_spelling_train_v2.jsonl.gz"

NUM_SAMPLES    = 1_000_000

MIN_LEN, MAX_LEN = 3, 15

print("=" * 80)
print("TẠO WORD-LEVEL SPELLING CORRECTION DATASET (v2, multi-error, richer typos)")
print("=" * 80 + "\n")

print(f"📖 Đọc word list từ {WIKI_DICT_FILE} ...\n")
with open(WIKI_DICT_FILE, "r", encoding="utf-8") as f:
    words = [w.strip() for w in f if w.strip()]

print(f"✅ Loaded {len(words):,} words")

words_filtered = [w for w in words if MIN_LEN <= len(w) <= MAX_LEN and w.isalpha()]
print(f"✅ Filtered to {len(words_filtered):,} words ({MIN_LEN}-{MAX_LEN} chars, alpha only)\n")

if not words_filtered:
    raise SystemExit("❌ Không còn từ hợp lệ sau khi lọc.")

TOP_K      = min(50_000, len(words_filtered))
TOP_10K    = min(10_000, len(words_filtered))
popular    = words_filtered[:TOP_K]
popular10k = words_filtered[:TOP_10K]

def pick_word():
    r = random.random()
    if r < 0.75:
        return random.choice(popular10k)
    elif r < 0.95:
        return random.choice(popular)
    else:
        return random.choice(words_filtered)

VOWELS = set("aeiouAEIOU")
CONSONANTS = set("bcdfghjklmnpqrstvwxyzBCDFGHJKLMNPQRSTVWXYZ")

KEYBOARD_NEIGHBORS = {
    'a':['s','q','w'], 's':['a','d','w','e'], 'd':['s','f','e','r'], 'f':['d','g','r','t'],
    'g':['f','h','t','y'], 'h':['g','j','y','u'], 'j':['h','k','u','i'], 'k':['j','l','i','o'],
    'l':['k','o','p'],
    'z':['x','a'], 'x':['z','c','s'], 'c':['x','v','d'], 'v':['c','b','f'], 'b':['v','n','g'],
    'n':['b','m','h'], 'm':['n','j'],
    'q':['w','a'], 'w':['q','e','s'], 'e':['w','r','d'], 'r':['e','t','f'],
    't':['r','y','g'], 'y':['t','u','h'], 'u':['y','i','j'], 'i':['u','o','k'], 'o':['i','p','l'],
    'p':['o','l'],
}

CONFUSIONS = [
    ("ie", "ei"), ("ph", "f"), ("ck", "k"), ("tion", "sion"), ("able", "ible"),
    ("ance", "ence"), ("ise", "ize"), ("ough", "uff"), ("yze", "yse")
]

DOUBLE_SET = ["tt","ss","rr","nn","mm","ll","pp","gg","dd","ff","cc","oo","ee"]

def is_title(s: str) -> bool:
    return len(s) >= 2 and s[0].isupper() and s[1:].islower()

def transfer_case(src: str, dst: str) -> str:
    if src.islower():   return dst.lower()
    if src.isupper():   return dst.upper()
    if is_title(src):   return dst.capitalize()
    return dst  

def replace_at(s: str, i: int, c: str) -> str:
    if not s: return s
    new_c = transfer_case(s[i], c)
    return s[:i] + new_c + s[i+1:]

def op_delete_char(w: str) -> str:
    if len(w) <= 2: return w
    i = random.randint(0, len(w)-1)
    return w[:i] + w[i+1:]

def op_insert_neighbor(w: str) -> str:
    i = random.randint(0, len(w))
    base = w[max(0, min(len(w)-1, i))]
    nb = KEYBOARD_NEIGHBORS.get(base.lower(), None)
    ch = random.choice(nb) if nb else random.choice("abcdefghijklmnopqrstuvwxyz")
    ch = transfer_case(base, ch)
    return w[:i] + ch + w[i:]

def op_substitute_neighbor(w: str) -> str:
    if not w: return w
    i = random.randint(0, len(w)-1)
    base = w[i]
    nb = KEYBOARD_NEIGHBORS.get(base.lower(), None)
    ch = random.choice(nb) if nb else random.choice("abcdefghijklmnopqrstuvwxyz")
    return replace_at(w, i, ch)

def op_transpose_adjacent(w: str) -> str:
    if len(w) < 2: return w
    i = random.randint(0, len(w)-2)
    a, b = w[i], w[i+1]
    return w[:i] + b + a + w[i+2:]

def op_duplicate_char(w: str) -> str:
    i = random.randint(0, len(w)-1)
    return w[:i+1] + w[i] + w[i+1:]

def op_drop_vowel(w: str) -> str:
    idx = [i for i, c in enumerate(w) if c in VOWELS]
    if not idx: return w
    i = random.choice(idx)
    if i in (0, len(w)-1) and len(idx) > 1:
        idx2 = [j for j in idx if j not in (0, len(w)-1)]
        if idx2: i = random.choice(idx2)
    return w[:i] + w[i+1:]

def op_drop_final_e(w: str) -> str:
    if w.endswith(("e","E")) and len(w) > 3:
        return w[:-1]
    return w

def op_confusion(w: str) -> str:
    s = w
    pair = random.choice(CONFUSIONS)
    a, b = pair if random.random() < 0.5 else (pair[1], pair[0])
    low = s.lower()
    if a in low:
        i = low.index(a)
        repl = transfer_case(s[i:i+len(a)], b)
        return s[:i] + repl + s[i+len(a):]
    return s

def op_double_single(w: str) -> str:
    s = w
    for d in DOUBLE_SET:
        i = s.lower().find(d)
        if i != -1:
            # bỏ bớt 1 ký tự
            return s[:i+1] + s[i+2:]
    # không có đôi: tạo đôi
    consonant_pos = [i for i,c in enumerate(s) if c in CONSONANTS]
    if not consonant_pos: return s
    i = random.choice(consonant_pos)
    return s[:i+1] + s[i] + s[i+1:]

def op_plural_noise(w: str) -> str:
    # thừa/thiếu 's' ở cuối
    if w.endswith(('s','S')) and len(w) > 2 and not w.endswith(('ss','SS')):
        return w[:-1]  # thiếu 's'
    else:
        base = w[-1] if w else 's'
        return w + transfer_case(base, 's')  # thừa 's'

OPS = [
    ("delete", op_delete_char),
    ("insert_nb", op_insert_neighbor),
    ("subs_nb", op_substitute_neighbor),
    ("transpose", op_transpose_adjacent),
    ("duplicate", op_duplicate_char),
    ("drop_vowel", op_drop_vowel),
    ("drop_final_e", op_drop_final_e),
    ("confusion", op_confusion),
    ("double_single", op_double_single),
    ("plural_noise", op_plural_noise),
]

def apply_ops(word: str, k: int, rng: random.Random) -> (str, list):
    ops_applied = []
    s = word
    tried = 0
    while len(ops_applied) < k and tried < 10*k:
        tried += 1
        name, fn = rng.choice(OPS)
        new_s = fn(s)
        if new_s != s and len(new_s) >= 2 and new_s.isprintable():
            s = new_s
            ops_applied.append(name)
    return s, ops_applied

# =========================
# ==== 4) GENERATE DATA ===
# =========================
print("=" * 80)
print("BƯỚC 2: TẠO SPELLING ERRORS (đa dạng & nhiều lỗi)")
print("=" * 80 + "\n")

rng = random.Random(42)
pairs = []
pairs_set = set()
type_counts = Counter()
ops_k_counts = Counter()

def ops_count_sampler():
    # 1 lỗi: 60%, 2 lỗi: 30%, 3 lỗi: 10%
    r = rng.random()
    if r < 0.60: return 1
    if r < 0.90: return 2
    return 3

attempts = 0
max_attempts = NUM_SAMPLES * 5

print(f"🎨 Mục tiêu tạo: {NUM_SAMPLES:,} cặp (có thể gồm 1–3 lỗi/ từ)\n")

while len(pairs) < NUM_SAMPLES and attempts < max_attempts:
    attempts += 1
    clean = pick_word()

    k = ops_count_sampler()
    noisy, applied = apply_ops(clean, k, rng)

    if noisy == clean or len(noisy) < 2:
        continue

    key = (noisy, clean)
    if key in pairs_set:
        continue

    # Chỉ cho phép alphabet + apostrophe để hợp logic train sau này
    if not re.fullmatch(r"[A-Za-z']{2,}", noisy):
        continue
    if not re.fullmatch(r"[A-Za-z']{2,}", clean):
        continue

    pairs.append({"noisy": noisy, "clean": clean})
    pairs_set.add(key)
    ops_k_counts[len(applied)] += 1
    for t in applied:
        type_counts[t] += 1

    if len(pairs) % 20_000 == 0:
        print(f"   Generated: {len(pairs):,} / {NUM_SAMPLES:,}")

print(f"\n✅ Generated {len(pairs):,} pairs (attempts={attempts:,})\n")

# =========================
# ===== 5) STATISTICS =====
# =========================
print("=" * 80)
print("THỐNG KÊ")
print("=" * 80 + "\n")

total = max(1, len(pairs))

print("📊 Số lỗi mỗi từ:")
for k in sorted(ops_k_counts):
    c = ops_k_counts[k]
    print(f"   {k} lỗi: {c:7,}  ({c/total*100:5.1f}%)")

print("\n📊 Phân bố theo loại lỗi:")
for name, c in type_counts.most_common():
    print(f"   {name:14s}: {c:7,}  ({c/total*100:5.1f}%)")

print("\n📝 Sample 10 cặp:")
for item in rng.sample(pairs, k=min(10, len(pairs))):
    print(f"   {item['noisy']:18s} → {item['clean']}")

# =========================
# ======= 6) SAVE =========
# =========================
print("\n" + "=" * 80)
print("LƯU FILE")
print("=" * 80 + "\n")

print(f"💾 Saving to {OUTPUT_FILE} ...")
with gzip.open(OUTPUT_FILE, "wt", encoding="utf-8") as f:
    for it in pairs:
        f.write(json.dumps(it, ensure_ascii=False) + "\n")

size_mb = Path(OUTPUT_FILE).stat().st_size / (1024*1024)
print(f"✅ Saved {len(pairs):,} pairs  (~{size_mb:.2f} MB)\n")

print("=" * 80)
print("HOÀN THÀNH!")
print("=" * 80)
print(f"\n📂 Output file: {OUTPUT_FILE}")
print(f"📊 Total samples: {len(pairs):,}")
print("👉 Tiếp theo: dùng lại script train của bạn (không cần đổi).")
