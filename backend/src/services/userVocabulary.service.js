"use strict";

const ResponseBuilder = require("../types/response/baseResponse");
const HTTP_STATUS = require("../constants/httpStatus");
const UserWordRepository = require("../repositories/userWord.repo");
const UserWordBookmarkRepository = require("../repositories/userWordBookmark.repo");
const WordRepository = require("../repositories/word.repo");
const achievementTracker = require("../helpers/achievementTracker.helper");

class UserVocabularyService {
    async getMyCustomWords(req) {
        const userId = req.user?._id;
        const { level, type, search, tags, pageNum = 1, pageSize = 50 } = req.query;

        try {
            const page = parseInt(pageNum);
            const limit = parseInt(pageSize);
            const skip = (page - 1) * limit;

            const words = await UserWordRepository.getUserWords(userId, {
                level,
                type,
                search,
                tags: tags ? tags.split(",") : undefined,
                skip,
                limit,
            });

            const total = await UserWordRepository.countUserWords(userId);

            return ResponseBuilder.success("Lấy danh sách từ thành công", {
                words,
                pagination: {
                    total,
                    pageNum: page,
                    pageSize: limit,
                    totalPages: Math.ceil(total / limit),
                },
            });
        } catch (error) {
            console.error("[UserVocabulary] Error getting custom words:", error);
            return ResponseBuilder.error(
                "Lỗi khi lấy danh sách từ",
                HTTP_STATUS.INTERNAL_SERVER_ERROR,
                error.message
            );
        }
    }

    async createCustomWord(req) {
        const userId = req.user?._id;
        const wordData = req.body;

        try {
            if (!wordData.word || !wordData.meaningVi) {
                return ResponseBuilder.badRequest("Từ và nghĩa tiếng Việt là bắt buộc");
            }

            const newWord = await UserWordRepository.createUserWord(userId, wordData);

            // Track word learned for achievements
            try {
                await achievementTracker.trackWordLearned(userId);
            } catch (e) {
                console.error("[UserVocabulary] Error tracking word learned:", e);
            }

            return ResponseBuilder.success("Thêm từ mới thành công", newWord);
        } catch (error) {
            console.error("[UserVocabulary] Error creating custom word:", error);
            return ResponseBuilder.error(
                "Lỗi khi thêm từ mới",
                HTTP_STATUS.INTERNAL_SERVER_ERROR,
                error.message
            );
        }
    }

    async updateCustomWord(req) {
        const userId = req.user?._id;
        const { wordId } = req.params;
        const updateData = req.body;

        try {
            const word = await UserWordRepository.getUserWordById(userId, wordId);
            if (!word) {
                return ResponseBuilder.notFoundError("Không tìm thấy từ");
            }

            const updatedWord = await UserWordRepository.updateUserWord(
                userId,
                wordId,
                updateData
            );

            return ResponseBuilder.success("Cập nhật từ thành công", updatedWord);
        } catch (error) {
            console.error("[UserVocabulary] Error updating custom word:", error);
            return ResponseBuilder.error(
                "Lỗi khi cập nhật từ",
                HTTP_STATUS.INTERNAL_SERVER_ERROR,
                error.message
            );
        }
    }

    async deleteCustomWord(req) {
        const userId = req.user?._id;
        const { wordId } = req.params;

        try {
            const word = await UserWordRepository.getUserWordById(userId, wordId);
            if (!word) {
                return ResponseBuilder.notFoundError("Không tìm thấy từ");
            }

            await UserWordRepository.deleteUserWord(userId, wordId);

            return ResponseBuilder.success("Xóa từ thành công", { wordId });
        } catch (error) {
            console.error("[UserVocabulary] Error deleting custom word:", error);
            return ResponseBuilder.error(
                "Lỗi khi xóa từ",
                HTTP_STATUS.INTERNAL_SERVER_ERROR,
                error.message
            );
        }
    }

    async getBookmarkedWords(req) {
        const userId = req.user?._id;
        const { source, masteryLevel, pageNum = 1, pageSize = 50 } = req.query;

        try {
            const page = parseInt(pageNum);
            const limit = parseInt(pageSize);
            const skip = (page - 1) * limit;

            const bookmarks = await UserWordBookmarkRepository.getBookmarkedWords(userId, {
                source,
                masteryLevel: masteryLevel ? parseInt(masteryLevel) : undefined,
                skip,
                limit,
            });

            const total = await UserWordBookmarkRepository.countBookmarks(userId);

            return ResponseBuilder.success("Lấy danh sách từ đã bookmark thành công", {
                bookmarks,
                pagination: {
                    total,
                    pageNum: page,
                    pageSize: limit,
                    totalPages: Math.ceil(total / limit),
                },
            });
        } catch (error) {
            console.error("[UserVocabulary] Error getting bookmarked words:", error);
            return ResponseBuilder.error(
                "Lỗi khi lấy danh sách từ đã bookmark",
                HTTP_STATUS.INTERNAL_SERVER_ERROR,
                error.message
            );
        }
    }

    async toggleBookmark(req) {
        const userId = req.user?._id;
        const { wordId } = req.params;
        const { source = "manual", sourceBlock } = req.body;

        try {
            const word = await WordRepository.findById(wordId);
            if (!word) {
                return ResponseBuilder.notFoundError("Không tìm thấy từ");
            }

            const isBookmarked = await UserWordBookmarkRepository.isWordBookmarked(
                userId,
                wordId
            );

            if (isBookmarked) {
                await UserWordBookmarkRepository.unbookmarkWord(userId, wordId);
                return ResponseBuilder.success("Đã bỏ bookmark từ", {
                    bookmarked: false,
                });
            } else {
                const bookmark = await UserWordBookmarkRepository.bookmarkWord(
                    userId,
                    wordId,
                    source,
                    sourceBlock
                );

                // Track word learned for achievements
                try {
                    await achievementTracker.trackWordLearned(userId);
                } catch (e) {
                    console.error("[UserVocabulary] Error tracking word learned:", e);
                }

                return ResponseBuilder.success("Đã bookmark từ", {
                    bookmarked: true,
                    bookmark,
                });
            }
        } catch (error) {
            console.error("[UserVocabulary] Error toggling bookmark:", error);
            return ResponseBuilder.error(
                "Lỗi khi thao tác bookmark",
                HTTP_STATUS.INTERNAL_SERVER_ERROR,
                error.message
            );
        }
    }

    async updateBookmarkNotes(req) {
        const userId = req.user?._id;
        const { wordId } = req.params;
        const { notes, masteryLevel } = req.body;

        try {
            const updateData = {};
            if (notes !== undefined) updateData.notes = notes;
            if (masteryLevel !== undefined) updateData.masteryLevel = masteryLevel;

            const bookmark = await UserWordBookmarkRepository.updateBookmark(
                userId,
                wordId,
                updateData
            );

            if (!bookmark) {
                return ResponseBuilder.notFoundError("Không tìm thấy bookmark");
            }

            return ResponseBuilder.success("Cập nhật bookmark thành công", bookmark);
        } catch (error) {
            console.error("[UserVocabulary] Error updating bookmark:", error);
            return ResponseBuilder.error(
                "Lỗi khi cập nhật bookmark",
                HTTP_STATUS.INTERNAL_SERVER_ERROR,
                error.message
            );
        }
    }

    async getAllVocabulary(req) {
        const userId = req.user?._id;

        try {
            const [customWords, bookmarkedWords, systemWords] = await Promise.all([
                UserWordRepository.getUserWords(userId, { limit: 100 }),
                UserWordBookmarkRepository.getBookmarkedWords(userId, { limit: 100 }),
                WordRepository.find({}, null, { limit: 100, sort: { createdAt: -1 } }),
            ]);

            const stats = {
                customWordsCount: await UserWordRepository.countUserWords(userId),
                bookmarkedCount: await UserWordBookmarkRepository.countBookmarks(userId),
                systemWordsCount: await WordRepository.model.countDocuments(),
            };

            return ResponseBuilder.success("Lấy tất cả từ vựng thành công", {
                customWords,
                bookmarkedWords,
                systemWords,
                stats,
            });
        } catch (error) {
            console.error("[UserVocabulary] Error getting all vocabulary:", error);
            return ResponseBuilder.error(
                "Lỗi khi lấy danh sách từ vựng",
                HTTP_STATUS.INTERNAL_SERVER_ERROR,
                error.message
            );
        }
    }
}

module.exports = new UserVocabularyService();
