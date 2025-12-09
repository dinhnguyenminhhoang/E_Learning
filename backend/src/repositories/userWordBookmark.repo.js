"use strict";

const UserWordBookmark = require("../models/UserWordBookmark");
const { toObjectId } = require("../helpers/idHelper");

class UserWordBookmarkRepository {
    async getBookmarkedWords(userId, options = {}) {
        const {
            source,
            masteryLevel,
            sort = { bookmarkedAt: -1 },
            skip = 0,
            limit = 50,
        } = options;

        const filter = { user: toObjectId(userId) };

        if (source) filter.source = source;
        if (masteryLevel !== undefined) filter.masteryLevel = masteryLevel;

        return await UserWordBookmark.find(filter)
            .populate("word")
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .lean();
    }

    async countBookmarks(userId, filter = {}) {
        return await UserWordBookmark.countDocuments({
            user: toObjectId(userId),
            ...filter,
        });
    }

    async bookmarkWord(userId, wordId, source = "manual", sourceBlock = null) {
        const bookmark = new UserWordBookmark({
            user: toObjectId(userId),
            word: toObjectId(wordId),
            source,
            sourceBlock: sourceBlock ? toObjectId(sourceBlock) : null,
        });
        return await bookmark.save();
    }

    async unbookmarkWord(userId, wordId) {
        return await UserWordBookmark.findOneAndDelete({
            user: toObjectId(userId),
            word: toObjectId(wordId),
        }).lean();
    }

    async isWordBookmarked(userId, wordId) {
        const bookmark = await UserWordBookmark.findOne({
            user: toObjectId(userId),
            word: toObjectId(wordId),
        }).lean();
        return !!bookmark;
    }

    async getBookmark(userId, wordId) {
        return await UserWordBookmark.findOne({
            user: toObjectId(userId),
            word: toObjectId(wordId),
        })
            .populate("word")
            .lean();
    }

    async updateBookmark(userId, wordId, updateData) {
        return await UserWordBookmark.findOneAndUpdate(
            {
                user: toObjectId(userId),
                word: toObjectId(wordId),
            },
            { $set: updateData },
            { new: true, runValidators: true }
        )
            .populate("word")
            .lean();
    }

    async bulkBookmark(userId, wordIds, source = "manual") {
        const bookmarks = wordIds.map((wordId) => ({
            user: toObjectId(userId),
            word: toObjectId(wordId),
            source,
        }));

        return await UserWordBookmark.insertMany(bookmarks, { ordered: false })
            .catch((err) => {
                if (err.code === 11000) {
                    return { insertedCount: err.result?.nInserted || 0 };
                }
                throw err;
            });
    }
}

module.exports = new UserWordBookmarkRepository();
