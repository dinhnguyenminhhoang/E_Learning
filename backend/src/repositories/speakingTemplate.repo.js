"use strict";

const SpeakingTemplate = require("../models/SpeakingTemplate");
const { STATUS } = require("../constants/status.constans");

class SpeakingTemplateRepository {
    async create(data) {
        return await SpeakingTemplate.create(data);
    }

    async findById(id) {
        return await SpeakingTemplate.findById(id);
    }

    async findAll(query = {}, options = {}) {
        const { page = 1, limit = 20, sort = { order: 1 } } = options;
        const skip = (page - 1) * limit;

        const [data, total] = await Promise.all([
            SpeakingTemplate.find(query)
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .lean(),
            SpeakingTemplate.countDocuments(query)
        ]);

        return {
            data,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    async findActive(query = {}, options = {}) {
        return await this.findAll({ ...query, status: STATUS.ACTIVE }, options);
    }

    async findByLevel(level, options = {}) {
        return await this.findActive({ level }, options);
    }

    async findByType(type, options = {}) {
        return await this.findActive({ type }, options);
    }

    async findByLevelAndType(level, type, options = {}) {
        const query = { status: STATUS.ACTIVE };
        if (level) query.level = level;
        if (type) query.type = type;
        return await this.findAll(query, options);
    }

    async update(id, data) {
        return await SpeakingTemplate.findByIdAndUpdate(id, data, { new: true });
    }

    async delete(id) {
        return await SpeakingTemplate.findByIdAndDelete(id);
    }

    async softDelete(id) {
        return await SpeakingTemplate.findByIdAndUpdate(
            id,
            { status: STATUS.DELETED },
            { new: true }
        );
    }

    async count(query = {}) {
        return await SpeakingTemplate.countDocuments(query);
    }

    async getCategories() {
        return await SpeakingTemplate.distinct("category", { status: STATUS.ACTIVE });
    }

    async getStats() {
        const stats = await SpeakingTemplate.aggregate([
            { $match: { status: STATUS.ACTIVE } },
            {
                $group: {
                    _id: { level: "$level", type: "$type" },
                    count: { $sum: 1 }
                }
            }
        ]);

        const result = {
            total: 0,
            byLevel: { easy: 0, medium: 0, hard: 0 },
            byType: { word: 0, sentence: 0 }
        };

        stats.forEach(s => {
            result.total += s.count;
            result.byLevel[s._id.level] = (result.byLevel[s._id.level] || 0) + s.count;
            result.byType[s._id.type] = (result.byType[s._id.type] || 0) + s.count;
        });

        return result;
    }

    async createMany(dataArray) {
        return await SpeakingTemplate.insertMany(dataArray);
    }

    async deleteMany(query = {}) {
        return await SpeakingTemplate.deleteMany(query);
    }
}

module.exports = new SpeakingTemplateRepository();
