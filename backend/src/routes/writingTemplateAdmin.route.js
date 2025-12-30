"use strict";

const express = require("express");
const router = express.Router();
const writingTemplateController = require("../controllers/writingTemplate.controller");
const { authenticate } = require("../middlewares/auth");
const { asynchandler } = require("../helpers/asyncHandler");

router.get("/", authenticate, asynchandler(writingTemplateController.adminGetAll));
router.post("/", authenticate, asynchandler(writingTemplateController.adminCreate));
router.post("/bulk", authenticate, asynchandler(writingTemplateController.adminCreateMany));
router.put("/:id", authenticate, asynchandler(writingTemplateController.adminUpdate));
router.delete("/:id", authenticate, asynchandler(writingTemplateController.adminDelete));
router.post("/seed", authenticate, asynchandler(writingTemplateController.adminSeedTemplates));
router.post("/ai-generate", authenticate, asynchandler(writingTemplateController.aiGenerateTemplates));

module.exports = router;
