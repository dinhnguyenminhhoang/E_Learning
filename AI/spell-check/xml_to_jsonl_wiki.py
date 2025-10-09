import os, re, json, gzip
from lxml import etree

INPUT_XML = r"C:/saveTempData/spell_check/data/enwiki-latest-pages-articles.xml"  # file XML đã extract
OUT_DIR = "wiki_shards"
MAX_DOCS_PER_SHARD = 50000
MIN_TOKENS, MAX_TOKENS = 5, 512

os.makedirs(OUT_DIR, exist_ok=True)

def clean_text(s: str) -> str:
    s = s.replace("\u00A0", " ")
    s = re.sub(r"\s+", " ", s).strip()
    return s

def flush(buf, idx):
    if not buf: return
    out = os.path.join(OUT_DIR, f"wiki_clean_{idx:05d}.jsonl.gz")
    with gzip.open(out, "wt", encoding="utf-8") as f:
        for ex in buf:
            f.write(json.dumps(ex, ensure_ascii=False) + "\n")
    print(f"Saved {out} ({len(buf)} docs)")

def main():
    ctx = etree.iterparse(INPUT_XML, events=("end",), tag="{*}page", recover=True, huge_tree=True)
    buf, shard_idx, kept, seen = [], 0, 0, 0
    for _, elem in ctx:
        seen += 1
        try:
            title_el = elem.find(".//{*}title")
            text_el  = elem.find(".//{*}text")
            if text_el is None or text_el.text is None:
                elem.clear(); continue
            raw = text_el.text
            txt = clean_text(raw)
            tok = len(txt.split())
            if tok < MIN_TOKENS or tok > MAX_TOKENS:
                elem.clear(); continue
            buf.append({"source":"wiki","text":txt})
            kept += 1
            if len(buf) >= MAX_DOCS_PER_SHARD:
                flush(buf, shard_idx); shard_idx += 1; buf = []
        finally:
            elem.clear()
            while elem.getprevious() is not None:
                del elem.getparent()[0]
        if seen % 20000 == 0:
            print(f"Processed {seen:,} pages | kept {kept:,}")
    flush(buf, shard_idx)
    print(f"Done. pages={seen:,} | kept={kept:,}")

if __name__ == "__main__":
    main()
