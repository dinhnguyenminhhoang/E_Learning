"use strict";

const { SuccessResponse } = require("../core/success.response");
const { BadRequestError, NotFoundError } = require("../core/error.response");
const speakingTemplateRepo = require("../repositories/speakingTemplate.repo");
const { STATUS } = require("../constants/status.constans");
const aiService = require("./ai.service");

class SpeakingTemplateService {
    async getTemplates(req) {
        const { level, type, category, page = 1, limit = 50 } = req.query;

        const query = { status: STATUS.ACTIVE };
        if (level) query.level = level;
        if (type) query.type = type;
        if (category) query.category = category;

        const result = await speakingTemplateRepo.findAll(query, { page, limit });
        return new SuccessResponse({
            message: "Get speaking templates successfully",
            metadata: result
        });
    }

    async getRandomTemplates(req) {
        const { level, type, count = 10 } = req.query;

        const query = { status: STATUS.ACTIVE };
        if (level) query.level = level;
        if (type) query.type = type;

        const result = await speakingTemplateRepo.findAll(query, { limit: 1000 });

        const shuffled = result.data.sort(() => Math.random() - 0.5);
        const selected = shuffled.slice(0, parseInt(count));

        return new SuccessResponse({
            message: "Get random templates successfully",
            metadata: {
                data: selected,
                total: selected.length
            }
        });
    }

    async getStats() {
        const stats = await speakingTemplateRepo.getStats();
        return new SuccessResponse({
            message: "Get stats successfully",
            metadata: stats
        });
    }

    async getCategories() {
        const categories = await speakingTemplateRepo.getCategories();
        return new SuccessResponse({
            message: "Get categories successfully",
            metadata: categories
        });
    }

    async adminGetAll(req) {
        const { level, type, category, status, page = 1, limit = 20 } = req.query;

        const query = {};
        if (level) query.level = level;
        if (type) query.type = type;
        if (category) query.category = category;
        if (status) query.status = status;

        const result = await speakingTemplateRepo.findAll(query, { page, limit });
        return new SuccessResponse({
            message: "Get all speaking templates successfully",
            metadata: result
        });
    }

    async adminCreate(req) {
        const { text, textVi, level, type, category, order } = req.body;
        const userId = req.user?._id;

        if (!text) {
            throw new BadRequestError("Text is required");
        }

        const template = await speakingTemplateRepo.create({
            text,
            textVi,
            level: level || "easy",
            type: type || "sentence",
            category,
            order: order || 0,
            createdBy: userId,
            status: STATUS.ACTIVE
        });

        return new SuccessResponse({
            message: "Create speaking template successfully",
            metadata: template
        });
    }

    async adminUpdate(req) {
        const { id } = req.params;
        const { text, textVi, level, type, category, order, status } = req.body;

        const existing = await speakingTemplateRepo.findById(id);
        if (!existing) {
            throw new NotFoundError("Speaking template not found");
        }

        const updateData = {};
        if (text !== undefined) updateData.text = text;
        if (textVi !== undefined) updateData.textVi = textVi;
        if (level !== undefined) updateData.level = level;
        if (type !== undefined) updateData.type = type;
        if (category !== undefined) updateData.category = category;
        if (order !== undefined) updateData.order = order;
        if (status !== undefined) updateData.status = status;

        const updated = await speakingTemplateRepo.update(id, updateData);
        return new SuccessResponse({
            message: "Update speaking template successfully",
            metadata: updated
        });
    }

    async adminDelete(req) {
        const { id } = req.params;

        const existing = await speakingTemplateRepo.findById(id);
        if (!existing) {
            throw new NotFoundError("Speaking template not found");
        }

        await speakingTemplateRepo.delete(id);
        return new SuccessResponse({
            message: "Delete speaking template successfully",
            metadata: { id }
        });
    }

    async adminCreateMany(req) {
        const { templates } = req.body;
        const userId = req.user?._id;

        if (!templates || !Array.isArray(templates) || templates.length === 0) {
            throw new BadRequestError("Templates array is required");
        }

        const dataToInsert = templates.map((t, index) => ({
            text: t.text,
            textVi: t.textVi,
            level: t.level || "easy",
            type: t.type || "sentence",
            category: t.category,
            order: t.order || index,
            createdBy: userId,
            status: STATUS.ACTIVE
        }));

        const created = await speakingTemplateRepo.createMany(dataToInsert);
        return new SuccessResponse({
            message: `Created ${created.length} speaking templates successfully`,
            metadata: {
                count: created.length
            }
        });
    }

    async adminSeedTemplates() {
        const { sampleTemplates } = require("../models/seeds/speakingTemplate.seed");

        const existingCount = await speakingTemplateRepo.count({});

        if (existingCount > 0) {
            throw new BadRequestError(`Database already has ${existingCount} speaking templates. Seeding skipped.`);
        }

        const dataToInsert = sampleTemplates.map((t) => ({
            ...t,
            status: STATUS.ACTIVE
        }));

        const created = await speakingTemplateRepo.createMany(dataToInsert);
        return new SuccessResponse({
            message: `Successfully seeded ${created.length} speaking templates`,
            metadata: {
                count: created.length
            }
        });
    }

    async aiGenerateTemplates(req) {
        const { count = 10, level = "medium", type = "sentence" } = req.body;
        const userId = req.user?._id;

        if (count < 1 || count > 20) {
            throw new BadRequestError("Count must be between 1 and 20");
        }

        const validLevels = ["easy", "medium", "hard"];
        const validTypes = ["word", "sentence"];

        if (!validLevels.includes(level)) {
            throw new BadRequestError(`Level must be one of: ${validLevels.join(", ")}`);
        }

        if (!validTypes.includes(type)) {
            throw new BadRequestError(`Type must be one of: ${validTypes.join(", ")}`);
        }

        try {
            const generatedTemplates = await aiService.generateSpeakingTemplates({
                count,
                level,
                type
            });

            const dataToInsert = generatedTemplates.map((t, index) => ({
                text: t.text,
                textVi: t.textVi,
                level: t.level || level,
                type: t.type || type,
                category: t.category,
                order: t.order || index,
                createdBy: userId,
                status: STATUS.ACTIVE
            }));

            const created = await speakingTemplateRepo.createMany(dataToInsert);

            return new SuccessResponse({
                message: `AI generated ${created.length} speaking templates successfully`,
                metadata: {
                    count: created.length,
                    templates: created
                }
            });
        } catch (error) {
            console.error("AI generation error:", error);
            throw new BadRequestError(error.message || "Failed to generate templates with AI");
        }
    }
}

module.exports = new SpeakingTemplateService();
