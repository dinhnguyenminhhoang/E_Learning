"use strict";

const writingTemplateService = require("../services/writingTemplate.service");

class WritingTemplateController {
    async getTemplates(req, res) {
        const result = await writingTemplateService.getTemplates(req);
        return result.send(res);
    }

    async getRandomTemplates(req, res) {
        const result = await writingTemplateService.getRandomTemplates(req);
        return result.send(res);
    }

    async getTemplateById(req, res) {
        const result = await writingTemplateService.getTemplateById(req);
        return result.send(res);
    }

    async getStats(req, res) {
        const result = await writingTemplateService.getStats();
        return result.send(res);
    }

    async getCategories(req, res) {
        const result = await writingTemplateService.getCategories();
        return result.send(res);
    }

    async adminGetAll(req, res) {
        const result = await writingTemplateService.adminGetAll(req);
        return result.send(res);
    }

    async adminCreate(req, res) {
        const result = await writingTemplateService.adminCreate(req);
        return result.send(res);
    }

    async adminUpdate(req, res) {
        const result = await writingTemplateService.adminUpdate(req);
        return result.send(res);
    }

    async adminDelete(req, res) {
        const result = await writingTemplateService.adminDelete(req);
        return result.send(res);
    }

    async adminCreateMany(req, res) {
        const result = await writingTemplateService.adminCreateMany(req);
        return result.send(res);
    }

    async adminSeedTemplates(req, res) {
        const result = await writingTemplateService.adminSeedTemplates();
        return result.send(res);
    }

    async publicSeedTemplates(req, res) {
        const result = await writingTemplateService.publicSeedTemplates();
        return result.send(res);
    }

    async aiGenerateTemplates(req, res) {
        const result = await writingTemplateService.aiGenerateTemplates(req);
        return result.send(res);
    }
}

module.exports = new WritingTemplateController();
