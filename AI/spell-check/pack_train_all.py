import gzip
paths=["train_synthetic.jsonl.gz","noisy_clean/clang8_train_rest.jsonl.gz"]
out="train_all.jsonl.gz"; n=0
with gzip.open(out,"wt",encoding="utf-8") as w:
    for p in paths:
        with gzip.open(p,"rt",encoding="utf-8") as f:
            for line in f: w.write(line); n+=1
print("Saved", out, "lines:", n)
