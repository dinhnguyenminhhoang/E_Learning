"use strict";

const express = require("express");
const router = express.Router();
const speakingTemplateController = require("../controllers/speakingTemplate.controller");
const { authenticate } = require("../middlewares/auth");
const { asynchandler } = require("../helpers/asyncHandler");

router.get("/templates", authenticate, asynchandler(speakingTemplateController.getTemplates));
router.get("/templates/random", authenticate, asynchandler(speakingTemplateController.getRandomTemplates));
router.get("/stats", authenticate, asynchandler(speakingTemplateController.getStats));
router.get("/categories", authenticate, asynchandler(speakingTemplateController.getCategories));

module.exports = router;
