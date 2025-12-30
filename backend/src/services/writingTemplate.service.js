"use strict";

const { SuccessResponse } = require("../core/success.response");
const { BadRequestError, NotFoundError } = require("../core/error.response");
const writingTemplateRepo = require("../repositories/writingTemplate.repo");
const { STATUS } = require("../constants/status.constans");
const aiService = require("./ai.service");

class WritingTemplateService {
    async getTemplates(req) {
        const { level, type, category, page = 1, limit = 50 } = req.query;

        const query = { status: STATUS.ACTIVE };
        if (level) query.level = level;
        if (type) query.type = type;
        if (category) query.category = category;

        const result = await writingTemplateRepo.findAll(query, { page, limit });
        return new SuccessResponse({
            message: "Get writing templates successfully",
            metadata: result
        });
    }

    async getRandomTemplates(req) {
        const { level, type, count = 10 } = req.query;

        const query = { status: STATUS.ACTIVE };
        if (level) query.level = level;
        if (type) query.type = type;

        const result = await writingTemplateRepo.findAll(query, { limit: 1000 });

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

    async getTemplateById(req) {
        const { id } = req.params;
        const template = await writingTemplateRepo.findById(id);

        if (!template) {
            throw new NotFoundError("Writing template not found");
        }

        return new SuccessResponse({
            message: "Get writing template successfully",
            metadata: template
        });
    }

    async getStats() {
        const stats = await writingTemplateRepo.getStats();
        return new SuccessResponse({
            message: "Get stats successfully",
            metadata: stats
        });
    }

    async getCategories() {
        const categories = await writingTemplateRepo.getCategories();
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

        const result = await writingTemplateRepo.findAll(query, { page, limit });
        return new SuccessResponse({
            message: "Get all writing templates successfully",
            metadata: result
        });
    }

    async adminCreate(req) {
        const { title, titleVi, prompt, promptVi, level, type, category, minWords, maxWords, sampleAnswer, hints, order } = req.body;
        const userId = req.user?._id;

        if (!title) {
            throw new BadRequestError("Title is required");
        }

        if (!prompt) {
            throw new BadRequestError("Prompt is required");
        }

        const template = await writingTemplateRepo.create({
            title,
            titleVi,
            prompt,
            promptVi,
            level: level || "easy",
            type: type || "essay",
            category,
            minWords: minWords || 100,
            maxWords: maxWords || 300,
            sampleAnswer,
            hints: hints || [],
            order: order || 0,
            createdBy: userId,
            status: STATUS.ACTIVE
        });

        return new SuccessResponse({
            message: "Create writing template successfully",
            metadata: template
        });
    }

    async adminUpdate(req) {
        const { id } = req.params;
        const { title, titleVi, prompt, promptVi, level, type, category, minWords, maxWords, sampleAnswer, hints, order, status } = req.body;

        const existing = await writingTemplateRepo.findById(id);
        if (!existing) {
            throw new NotFoundError("Writing template not found");
        }

        const updateData = {};
        if (title !== undefined) updateData.title = title;
        if (titleVi !== undefined) updateData.titleVi = titleVi;
        if (prompt !== undefined) updateData.prompt = prompt;
        if (promptVi !== undefined) updateData.promptVi = promptVi;
        if (level !== undefined) updateData.level = level;
        if (type !== undefined) updateData.type = type;
        if (category !== undefined) updateData.category = category;
        if (minWords !== undefined) updateData.minWords = minWords;
        if (maxWords !== undefined) updateData.maxWords = maxWords;
        if (sampleAnswer !== undefined) updateData.sampleAnswer = sampleAnswer;
        if (hints !== undefined) updateData.hints = hints;
        if (order !== undefined) updateData.order = order;
        if (status !== undefined) updateData.status = status;

        const updated = await writingTemplateRepo.update(id, updateData);
        return new SuccessResponse({
            message: "Update writing template successfully",
            metadata: updated
        });
    }

    async adminDelete(req) {
        const { id } = req.params;

        const existing = await writingTemplateRepo.findById(id);
        if (!existing) {
            throw new NotFoundError("Writing template not found");
        }

        await writingTemplateRepo.delete(id);
        return new SuccessResponse({
            message: "Delete writing template successfully",
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
            title: t.title,
            titleVi: t.titleVi,
            prompt: t.prompt,
            promptVi: t.promptVi,
            level: t.level || "easy",
            type: t.type || "essay",
            category: t.category,
            minWords: t.minWords || 100,
            maxWords: t.maxWords || 300,
            sampleAnswer: t.sampleAnswer,
            hints: t.hints || [],
            order: t.order || index,
            createdBy: userId,
            status: STATUS.ACTIVE
        }));

        const created = await writingTemplateRepo.createMany(dataToInsert);
        return new SuccessResponse({
            message: `Created ${created.length} writing templates successfully`,
            metadata: {
                count: created.length
            }
        });
    }

    async adminSeedTemplates() {
        const { sampleTemplates } = require("../models/seeds/writingTemplate.seed");

        const existingCount = await writingTemplateRepo.count({});

        if (existingCount > 0) {
            throw new BadRequestError(`Database already has ${existingCount} writing templates. Seeding skipped.`);
        }

        const dataToInsert = sampleTemplates.map((t) => ({
            ...t,
            status: STATUS.ACTIVE
        }));

        const created = await writingTemplateRepo.createMany(dataToInsert);
        return new SuccessResponse({
            message: `Successfully seeded ${created.length} writing templates`,
            metadata: {
                count: created.length
            }
        });
    }

    async publicSeedTemplates() {
        const { sampleTemplates } = require("../models/seeds/writingTemplate.seed");

        const existingCount = await writingTemplateRepo.count({});

        if (existingCount > 0) {
            throw new BadRequestError(`Database already has ${existingCount} writing templates. Cannot seed again.`);
        }

        const dataToInsert = sampleTemplates.map((t) => ({
            ...t,
            status: STATUS.ACTIVE
        }));

        const created = await writingTemplateRepo.createMany(dataToInsert);
        return new SuccessResponse({
            message: `Successfully seeded ${created.length} writing templates`,
            metadata: {
                count: created.length
            }
        });
    }

    async aiGenerateTemplates(req) {
        const { count = 5, level = "medium", type = "essay" } = req.body;
        const userId = req.user?._id;

        if (count < 1 || count > 10) {
            throw new BadRequestError("Count must be between 1 and 10");
        }

        const validLevels = ["easy", "medium", "hard"];
        const validTypes = ["essay", "email", "story", "description", "opinion"];

        if (!validLevels.includes(level)) {
            throw new BadRequestError(`Level must be one of: ${validLevels.join(", ")}`);
        }

        if (!validTypes.includes(type)) {
            throw new BadRequestError(`Type must be one of: ${validTypes.join(", ")}`);
        }

        try {
            const generatedTemplates = await aiService.generateWritingTemplates({
                count,
                level,
                type
            });

            const dataToInsert = generatedTemplates.map((t) => ({
                title: t.title,
                titleVi: t.titleVi,
                prompt: t.prompt,
                promptVi: t.promptVi,
                level: t.level || level,
                type: t.type || type,
                category: t.category,
                minWords: t.minWords || 100,
                maxWords: t.maxWords || 300,
                sampleAnswer: t.sampleAnswer,
                hints: t.hints || [],
                order: 0,
                createdBy: userId,
                status: STATUS.ACTIVE
            }));

            const created = await writingTemplateRepo.createMany(dataToInsert);

            return new SuccessResponse({
                message: `AI generated ${created.length} writing templates successfully`,
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

module.exports = new WritingTemplateService();
