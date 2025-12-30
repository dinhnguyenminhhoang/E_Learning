"use strict";

const speakingTemplateService = require("../services/speakingTemplate.service");

class SpeakingTemplateController {
    async getTemplates(req, res) {
        const result = await speakingTemplateService.getTemplates(req);
        return result.send(res);
    }

    async getRandomTemplates(req, res) {
        const result = await speakingTemplateService.getRandomTemplates(req);
        return result.send(res);
    }

    async getStats(req, res) {
        const result = await speakingTemplateService.getStats();
        return result.send(res);
    }

    async getCategories(req, res) {
        const result = await speakingTemplateService.getCategories();
        return result.send(res);
    }

    async adminGetAll(req, res) {
        const result = await speakingTemplateService.adminGetAll(req);
        return result.send(res);
    }

    async adminCreate(req, res) {
        const result = await speakingTemplateService.adminCreate(req);
        return result.send(res);
    }

    async adminUpdate(req, res) {
        const result = await speakingTemplateService.adminUpdate(req);
        return result.send(res);
    }

    async adminDelete(req, res) {
        const result = await speakingTemplateService.adminDelete(req);
        return result.send(res);
    }

    async adminCreateMany(req, res) {
        const result = await speakingTemplateService.adminCreateMany(req);
        return result.send(res);
    }

    async adminSeedTemplates(req, res) {
        const result = await speakingTemplateService.adminSeedTemplates();
        return result.send(res);
    }

    async aiGenerateTemplates(req, res) {
        const result = await speakingTemplateService.aiGenerateTemplates(req);
        return result.send(res);
    }
}

module.exports = new SpeakingTemplateController();
