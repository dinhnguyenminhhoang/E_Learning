"use strict";

const WritingTemplate = require("../models/WritingTemplate");
const { STATUS } = require("../constants/status.constans");

class WritingTemplateRepository {
    async create(data) {
        return await WritingTemplate.create(data);
    }

    async findById(id) {
        return await WritingTemplate.findById(id);
    }

    async findAll(query = {}, options = {}) {
        const { page = 1, limit = 20, sort = { order: 1 } } = options;
        const skip = (page - 1) * limit;

        const [data, total] = await Promise.all([
            WritingTemplate.find(query)
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .lean(),
            WritingTemplate.countDocuments(query)
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
        return await WritingTemplate.findByIdAndUpdate(id, data, { new: true });
    }

    async delete(id) {
        return await WritingTemplate.findByIdAndDelete(id);
    }

    async softDelete(id) {
        return await WritingTemplate.findByIdAndUpdate(
            id,
            { status: STATUS.DELETED },
            { new: true }
        );
    }

    async count(query = {}) {
        return await WritingTemplate.countDocuments(query);
    }

    async getCategories() {
        return await WritingTemplate.distinct("category", { status: STATUS.ACTIVE });
    }

    async getStats() {
        const stats = await WritingTemplate.aggregate([
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
            byType: { essay: 0, email: 0, story: 0, description: 0, opinion: 0 }
        };

        stats.forEach(s => {
            result.total += s.count;
            result.byLevel[s._id.level] = (result.byLevel[s._id.level] || 0) + s.count;
            result.byType[s._id.type] = (result.byType[s._id.type] || 0) + s.count;
        });

        return result;
    }

    async createMany(dataArray) {
        return await WritingTemplate.insertMany(dataArray);
    }

    async deleteMany(query = {}) {
        return await WritingTemplate.deleteMany(query);
    }
}

module.exports = new WritingTemplateRepository();
