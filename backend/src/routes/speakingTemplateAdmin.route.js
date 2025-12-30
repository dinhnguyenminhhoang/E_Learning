"use strict";

const express = require("express");
const router = express.Router();
const speakingTemplateController = require("../controllers/speakingTemplate.controller");
const { authenticate } = require("../middlewares/auth");
const { asynchandler } = require("../helpers/asyncHandler");

router.get("/", authenticate, asynchandler(speakingTemplateController.adminGetAll));
router.post("/", authenticate, asynchandler(speakingTemplateController.adminCreate));
router.post("/bulk", authenticate, asynchandler(speakingTemplateController.adminCreateMany));
router.put("/:id", authenticate, asynchandler(speakingTemplateController.adminUpdate));
router.delete("/:id", authenticate, asynchandler(speakingTemplateController.adminDelete));
router.post("/seed", authenticate, asynchandler(speakingTemplateController.adminSeedTemplates));
router.post("/ai-generate", authenticate, asynchandler(speakingTemplateController.aiGenerateTemplates));

module.exports = router;
