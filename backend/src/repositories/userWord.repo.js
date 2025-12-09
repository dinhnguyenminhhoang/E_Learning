"use strict";

const UserWord = require("../models/UserWord");
const { toObjectId } = require("../helpers/idHelper");

class UserWordRepository {
    async getUserWords(userId, options = {}) {
        const {
            level,
            type,
            search,
            tags,
            sort = { createdAt: -1 },
            skip = 0,
            limit = 50,
        } = options;

        const filter = {
            user: toObjectId(userId),
            deleted: { $ne: true },
        };

        if (level) filter.level = level;
        if (type) filter.type = type;
        if (tags && tags.length > 0) filter.tags = { $in: tags };
        if (search) {
            filter.$or = [
                { word: { $regex: search, $options: "i" } },
                { meaningVi: { $regex: search, $options: "i" } },
            ];
        }

        return await UserWord.find(filter)
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .lean();
    }

    async countUserWords(userId, filter = {}) {
        return await UserWord.countDocuments({
            user: toObjectId(userId),
            deleted: { $ne: true },
            ...filter,
        });
    }

    async createUserWord(userId, wordData) {
        const userWord = new UserWord({
            user: toObjectId(userId),
            ...wordData,
        });
        return await userWord.save();
    }

    async getUserWordById(userId, wordId) {
        return await UserWord.findOne({
            _id: toObjectId(wordId),
            user: toObjectId(userId),
            deleted: { $ne: true },
        }).lean();
    }

    async updateUserWord(userId, wordId, updateData) {
        return await UserWord.findOneAndUpdate(
            {
                _id: toObjectId(wordId),
                user: toObjectId(userId),
                deleted: { $ne: true },
            },
            { $set: updateData },
            { new: true, runValidators: true }
        ).lean();
    }

    async deleteUserWord(userId, wordId) {
        return await UserWord.findOneAndUpdate(
            {
                _id: toObjectId(wordId),
                user: toObjectId(userId),
            },
            { $set: { deleted: true } },
            { new: true }
        ).lean();
    }

    async searchUserWords(userId, query) {
        return await UserWord.find({
            user: toObjectId(userId),
            deleted: { $ne: true },
            $or: [
                { word: { $regex: query, $options: "i" } },
                { meaningVi: { $regex: query, $options: "i" } },
                { tags: { $in: [new RegExp(query, "i")] } },
            ],
        })
            .limit(20)
            .lean();
    }
}

module.exports = new UserWordRepository();
