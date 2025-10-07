import gzip, json

INP = "train_all.jsonl.gz"   
OUT = "spm_corpus.txt"
LIMIT = 2_000_000_000_000             # số dòng clean tối đa (tùy RAM/đĩa; có thể tăng/giảm)

n = 0
with open(OUT, "w", encoding="utf-8") as w, gzip.open(INP, "rt", encoding="utf-8") as f:
    for i, line in enumerate(f, 1):
        o = json.loads(line)
        clean = o.get("clean", "").replace("\n", " ").strip()
        if clean:
            w.write(clean + "\n")
            n += 1
            if n >= LIMIT:
                break
print("wrote", OUT, "lines:", n)
