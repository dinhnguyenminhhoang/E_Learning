import sentencepiece as spm

spm.SentencePieceTrainer.Train(
    input='spm_corpus.txt',
    model_prefix='spm_en',
    vocab_size=32000,
    model_type='bpe',
    character_coverage=1.0,
    pad_id=0,
    unk_id=1,
    bos_id=2,
    eos_id=3,
    input_sentence_size=5000000,
    shuffle_input_sentence=True
)

print("✅ Done! Sinh ra spm_en.model và spm_en.vocab")
