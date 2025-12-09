"use strict";

const UserVocabularyService = require("../services/userVocabulary.service");

class UserVocabularyController {
    async getMyCustomWords(req, res, next) {
        const result = await UserVocabularyService.getMyCustomWords(req);
        return res.status(result.code).json(result);
    }

    async createCustomWord(req, res, next) {
        const result = await UserVocabularyService.createCustomWord(req);
        return res.status(result.code).json(result);
    }

    async updateCustomWord(req, res, next) {
        const result = await UserVocabularyService.updateCustomWord(req);
        return res.status(result.code).json(result);
    }

    async deleteCustomWord(req, res, next) {
        const result = await UserVocabularyService.deleteCustomWord(req);
        return res.status(result.code).json(result);
    }

    async getBookmarkedWords(req, res, next) {
        const result = await UserVocabularyService.getBookmarkedWords(req);
        return res.status(result.code).json(result);
    }

    async toggleBookmark(req, res, next) {
        const result = await UserVocabularyService.toggleBookmark(req);
        return res.status(result.code).json(result);
    }

    async updateBookmarkNotes(req, res, next) {
        const result = await UserVocabularyService.updateBookmarkNotes(req);
        return res.status(result.code).json(result);
    }

    async getAllVocabulary(req, res, next) {
        const result = await UserVocabularyService.getAllVocabulary(req);
        return res.status(result.code).json(result);
    }
}

module.exports = new UserVocabularyController();
