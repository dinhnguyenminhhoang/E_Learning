"use strict";

const { SuccessResponse } = require("../core/success.response");
const { badRequestError, NotFoundError } = require("../core/error.response");
const AIAssistantService = require("../services/aiAssistant.service");

class AIAssistantController {
    chat = async (req, res, next) => {
        const { message, conversationId } = req.body;
        const userId = req.user._id;
        if (!message || message.trim().length === 0) {
            throw new badRequestError("Message is required");
        }

        const result = await AIAssistantService.chat(userId, message.trim(), conversationId);

        new SuccessResponse({
            message: "Message sent successfully",
            metadata: result
        }).send(res);
    };

    correctGrammar = async (req, res, next) => {
        const { text } = req.body;

        if (!text || text.trim().length === 0) {
            throw new badRequestError("Text is required");
        }

        console.log(`[AI Assistant] Grammar check for: "${text.substring(0, 50)}..."`);

        const result = await AIAssistantService.correctGrammar(text.trim());

        new SuccessResponse({
            message: "Grammar checked successfully",
            metadata: result
        }).send(res);
    };

    // Explain vocabulary word
    explainVocabulary = async (req, res, next) => {
        const { word, context } = req.body;

        if (!word || word.trim().length === 0) {
            throw new badRequestError("Word is required");
        }

        console.log(`[AI Assistant] Explaining word: "${word}"`);

        const result = await AIAssistantService.explainVocabulary(word.trim(), context);

        new SuccessResponse({
            message: "Word explained successfully",
            metadata: result
        }).send(res);
    };

    // Get user's conversation list
    getConversations = async (req, res, next) => {
        const userId = req.user._id;
        const limit = parseInt(req.query.limit) || 20;

        const conversations = await AIAssistantService.getConversations(userId, limit);

        new SuccessResponse({
            message: "Conversations retrieved successfully",
            metadata: conversations
        }).send(res);
    };

    // Get single conversation with messages
    getConversation = async (req, res, next) => {
        const userId = req.user._id;
        const conversationId = req.params.id;

        const conversation = await AIAssistantService.getConversation(userId, conversationId);

        new SuccessResponse({
            message: "Conversation retrieved successfully",
            metadata: conversation
        }).send(res);
    };

    // Create new conversation
    createConversation = async (req, res, next) => {
        const userId = req.user._id;
        const { title } = req.body;

        const conversation = await AIAssistantService.createConversation(userId, title);

        new SuccessResponse({
            message: "Conversation created successfully",
            metadata: {
                _id: conversation._id,
                title: conversation.title,
                createdAt: conversation.createdAt
            }
        }).send(res);
    };

    // Delete conversation
    deleteConversation = async (req, res, next) => {
        const userId = req.user._id;
        const conversationId = req.params.id;

        await AIAssistantService.deleteConversation(userId, conversationId);

        new SuccessResponse({
            message: "Conversation deleted successfully"
        }).send(res);
    };
}

module.exports = new AIAssistantController();
