import os, gzip, json, glob
import pyarrow as pa
import pyarrow.parquet as pq

C4_DIR   = "c4_shards"
WIKI_DIR = "wiki_shards"
OUT_DIR  = "clean_merged"
OUT_PARQUET = os.path.join(OUT_DIR, "clean.parquet")

BATCH_ROWS = 100_000   

os.makedirs(OUT_DIR, exist_ok=True)

schema = pa.schema([
    pa.field("source", pa.string()),
    pa.field("text",   pa.string()),
])

def yield_rows():
    # C4
    for f in sorted(glob.glob(os.path.join(C4_DIR, "*.jsonl.gz"))):
        with gzip.open(f, "rt", encoding="utf-8") as fp:
            for line in fp:
                o = json.loads(line)
                text = o.get("text")
                if text:
                    yield {"source": "c4", "text": text}
    # WIKI
    for f in sorted(glob.glob(os.path.join(WIKI_DIR, "*.jsonl.gz"))):
        with gzip.open(f, "rt", encoding="utf-8") as fp:
            for line in fp:
                o = json.loads(line)
                text = o.get("text")
                if text:
                    yield {"source": "wiki", "text": text}

def main():
    writer = None
    batch = []
    total = 0

    for row in yield_rows():
        batch.append(row)
        if len(batch) >= BATCH_ROWS:
            table = pa.Table.from_pylist(batch, schema=schema)
            if writer is None:
                writer = pq.ParquetWriter(OUT_PARQUET, schema=schema,
                                          compression="zstd", version="2.6")
            writer.write_table(table)
            total += len(batch)
            print(f"Wrote {total:,} rows")
            batch.clear()

    # flush cuối
    if batch:
        table = pa.Table.from_pylist(batch, schema=schema)
        if writer is None:
            writer = pq.ParquetWriter(OUT_PARQUET, schema=schema,
                                      compression="zstd", version="2.6")
        writer.write_table(table)
        total += len(batch)
        print(f"Wrote {total:,} rows")

    if writer is not None:
        writer.close()
    print("Done ->", OUT_PARQUET, "| total rows:", total)

if __name__ == "__main__":
    main()
