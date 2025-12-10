"use strict";

const express = require("express");
const router = express.Router();
const aiAssistantController = require("../controllers/aiAssistant.controller");
const { asynchandler } = require("../helpers/asyncHandler");
const { authenticate } = require("../middlewares/auth");


router.post("/chat", authenticate, asynchandler(aiAssistantController.chat));

router.post("/grammar/correct", authenticate, asynchandler(aiAssistantController.correctGrammar));


router.post("/vocabulary/explain", authenticate, asynchandler(aiAssistantController.explainVocabulary));

router.get("/conversations", authenticate, asynchandler(aiAssistantController.getConversations));

router.post("/conversations", authenticate, asynchandler(aiAssistantController.createConversation));

router.get("/conversations/:id", authenticate, asynchandler(aiAssistantController.getConversation));

router.delete("/conversations/:id", authenticate, asynchandler(aiAssistantController.deleteConversation));

module.exports = router;
