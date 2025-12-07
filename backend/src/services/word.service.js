"use strict";

const ResponseBuilder = require("../types/response/baseResponse");
const WordRepository = require("../repositories/word.repo");
const CategoryRepository = require("../repositories/category.repo");
const { default: mongoose } = require("mongoose");
const RESPONSE_MESSAGES = require("../constants/responseMessage");
const { importWordSchema } = require("../utils/validate/word");
const XLSX = require("xlsx");
const {
  WORD_REQUIRED_HEADERS,
  dataSample,
} = require("../constants/fileUpload");
const { STATUS } = require("../constants/status.constans");
const wordRepo = require("../repositories/word.repo");

class WordService {
  async createWord(req) {
    const {
      word,
      pronunciation,
      audio,
      partOfSpeech,
      level,
      frequency,
      definitions,
      synonyms = [],
      antonyms = [],
      relatedWords = [],
      categories = [],
      tags = [],
      image,
      difficulty,
      isActive,
    } = req.body;

    const existingWord = await WordRepository.findByWordText(word);
    if (existingWord) {
      if (existingWord.status === STATUS.DELETED) {
        const updated = await WordRepository.updateById(existingWord._id, {
          ...req.body,
        });
        return ResponseBuilder.success(
          "Word restored and updated successfully",
          { word: updated },
          200
        );
      }
      return ResponseBuilder.duplicateError();
    }

    const finalPronunciation = pronunciation;
    const finalAudio = audio;

    const newWordData = {
      word: word.toLowerCase().trim(),
      pronunciation: finalPronunciation,
      audio: finalAudio,
      partOfSpeech,
      level,
      frequency: Math.max(0, frequency),
      definitions: definitions.map((def) => ({
        meaning: def.meaning.trim(),
        meaningVi: def.meaningVi.trim(),
        examples: def.examples || [],
      })),
      synonyms: synonyms.map((s) => s.trim().toLowerCase()),
      antonyms: antonyms.map((a) => a.trim().toLowerCase()),
      relatedWords: relatedWords.map((r) => r.trim().toLowerCase()),
      categories,
      tags: tags.map((t) => t.trim().toLowerCase()),
      image,
      difficulty: Math.min(5, Math.max(1, difficulty)),
      isActive,
      createdBy: req.user._id,
    };

    const newWord = await WordRepository.createWord(newWordData);
    const populatedWord = await WordRepository.findById(newWord._id);

    return ResponseBuilder.success(
      "Word created successfully",
      { word: populatedWord },
      201
    );
  }

  async getWordsByCategory(req) {
    const { categoryId } = req.params;
    const existingCategory = await CategoryRepository.findById(categoryId, {});
    if (!existingCategory) {
      return ResponseBuilder.notFoundError();
    }
    const words = await WordRepository.search(
      { categories: [new mongoose.Types.ObjectId(categoryId)] },
      req.query
    );

    return ResponseBuilder.success(
      RESPONSE_MESSAGES.SUCCESS.FETCHED,
      { words },
      200
    );
  }

  async updateWord(req) {
    const { wordId } = req.params;
    const updateData = req.body;
    const word = await WordRepository.findById(wordId);
    if (!word) {
      return ResponseBuilder.notFoundError();
    }
    if (word.word !== updateData.word) {
      const existingWord = await WordRepository.findByWordText(updateData.word);
      if (existingWord) {
        if (existingWord.status === STATUS.DELETED) {
          //nếu tồn tại nhưng đã bị xóa mềm thì xóa hẳn và cho phép cập nhật
          await WordRepository.hardDelete(existingWord._id);
        } else {
          return ResponseBuilder.duplicateError();
        }
      }
    }

    const updatedWord = await WordRepository.updateById(wordId, updateData);
    return ResponseBuilder.success(
      RESPONSE_MESSAGES.SUCCESS.UPDATED,
      { word: updatedWord },
      200
    );
  }

  async deleteWord(req) {
    const { wordId } = req.params;
    await WordRepository.softDelete(wordId);
    return ResponseBuilder.success(
      RESPONSE_MESSAGES.SUCCESS.DELETED,
      null,
      200
    );
  }

  async getAllWord(req) {
    const { data, metadata } = await wordRepo.getAllWords(req);
    return ResponseBuilder.successWithPagination(
      "Lấy danh sách thành công",
      data ?? [],
      {
        pageNum: metadata.pageNum,
        pageSize: metadata.pageSize,
        total: metadata.totalItems,
      }
    );
  }

  async getWordById(wordId) {
    const word = await WordRepository.findById(wordId);
    if (!word) {
      return ResponseBuilder.notFoundError("Word not found");
    }
    return ResponseBuilder.success(RESPONSE_MESSAGES.SUCCESS.FETCHED, word);
  }

  async importWords(req) {
    if (!req.file) {
      return ResponseBuilder.badRequest("No file uploaded");
    }

    // Parse Excel từ buffer
    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const wordList = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
    const sheet = workbook.Sheets[sheetName];

    const headerRow = XLSX.utils.sheet_to_json(sheet, { header: 1 })[0];

    const missingHeaders = WORD_REQUIRED_HEADERS.filter(
      (h) => !headerRow.includes(h)
    );

    if (missingHeaders.length > 0) {
      return ResponseBuilder.validationError(
        `Missing required columns: ${missingHeaders.join(", ")}`
      );
    }
    const failed = [];
    const success = [];
    const duplicates = [];
    const bulkOps = [];

    // Lấy toàn bộ word trong file Excel
    const words = wordList
      .map((w) => (w.word ? w.word?.toLowerCase().trim() : null))
      .filter((w) => !!w);

    // Query DB một lần
    const existingWords = await WordRepository.find(
      {
        word: { $in: words },
      },
      null,
      {},
      true
    );

    // Map để tra nhanh
    const wordMap = new Map();
    existingWords.forEach((w) => wordMap.set(w.word, w));

    // Loop qua từng dòng Excel
    for (let i = 0; i < wordList.length; i++) {
      const raw = wordList[i];

      try {
        // Chuẩn hóa categories
        if (raw.categories) {
          if (typeof raw.categories === "string") {
            raw.categories = raw.categories
              .replace(/[\[\]']/g, "")
              .split(/[;,]/)
              .map((c) => c.trim())
              .filter((c) => c.length > 0);
          }
        } else {
          raw.categories = [];
        }

        // Chuẩn hóa tags
        if (raw.tags && typeof raw.tags === "string") {
          raw.tags = raw.tags
            .split(/[;,]/)
            .map((t) => t.trim().toLowerCase())
            .filter((t) => t.length > 0);
        }

        // Validate dữ liệu
        const data = await importWordSchema.validateAsync(raw, {
          abortEarly: false,
        });

        const normalized = {
          word: data.word.toLowerCase().trim(),
          pronunciation: data.pronunciation,
          audio: data.audio,
          partOfSpeech: data.partOfSpeech,
          level: data.level,
          frequency: Math.max(0, data.frequency),
          categories: data.categories,
          tags: data.tags,
          image: data.image,
          difficulty: Math.min(5, Math.max(1, data.difficulty)),
          isActive: data.isActive,
        };

        const existing = wordMap.get(normalized.word);

        if (!existing) {
          // Word chưa tồn tại → thêm mới
          bulkOps.push({
            updateOne: {
              filter: { word: normalized.word },
              update: { $set: normalized },
              upsert: true,
            },
          });
          success.push(normalized.word);
        } else if (existing && existing.isActive === false) {
          // Tồn tại nhưng inactive → bật lại
          bulkOps.push({
            updateOne: {
              filter: { word: normalized.word },
              update: {
                $set: normalized,
                $setOnInsert: { createdAt: new Date() },
              },
              upsert: true,
            },
          });
          success.push(normalized.word);
        } else {
          // Đã tồn tại và active → duplicate
          duplicates.push(normalized.word);
        }
      } catch (err) {
        const errorMessages = err.details
          ? err.details.map((d) => d.message)
          : [err.message];

        console.error(
          `❌ Row ${i + 2} (${raw.word || "N/A"}) bị lỗi validate:`,
          errorMessages
        );

        failed.push({
          row: i + 2,
          word: raw.word,
          error: errorMessages,
        });
      }
    }

    if (bulkOps.length > 0) {
      await WordRepository.bulkWrite(bulkOps, { ordered: false });
    }

    return ResponseBuilder.success("Import completed", {
      successCount: success.length,
      failedCount: failed.length,
      duplicateCount: duplicates.length,
      successWords: success,
      failedRecords: failed,
      duplicateWords: duplicates,
    });
  }

  async exportSampleFile() {
    const worksheet = XLSX.utils.json_to_sheet(dataSample);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "SampleWords");

    const fileName = "sample_words.xlsx";
    const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "buffer" });

    return { buffer, fileName };
  }
}

module.exports = new WordService();
