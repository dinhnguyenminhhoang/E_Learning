"use strict";

const express = require("express");
const router = express.Router();
const writingTemplateController = require("../controllers/writingTemplate.controller");
const { authenticate } = require("../middlewares/auth");
const { asynchandler } = require("../helpers/asyncHandler");

router.get("/templates", authenticate, asynchandler(writingTemplateController.getTemplates));
router.get("/templates/random", authenticate, asynchandler(writingTemplateController.getRandomTemplates));
router.get("/templates/:id", authenticate, asynchandler(writingTemplateController.getTemplateById));
router.get("/stats", authenticate, asynchandler(writingTemplateController.getStats));
router.get("/categories", authenticate, asynchandler(writingTemplateController.getCategories));

router.post("/seed", asynchandler(writingTemplateController.publicSeedTemplates));

module.exports = router;
