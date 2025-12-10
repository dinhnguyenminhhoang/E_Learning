"use strict";

const { model, Schema, Types } = require("mongoose");

const DOCUMENT_NAME = "ChatHistory";
const COLLECTION_NAME = "chat_histories";

const messageSchema = new Schema({
    role: {
        type: String,
        enum: ["user", "assistant", "system"],
        required: true
    },
    content: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
}, { _id: false });

const chatHistorySchema = new Schema({
    userId: {
        type: Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },
    title: {
        type: String,
        default: "Cuộc trò chuyện mới",
        maxLength: 100
    },
    messages: [messageSchema],
    isActive: {
        type: Boolean,
        default: true,
        index: true
    }
}, {
    timestamps: true,
    collection: COLLECTION_NAME,
    versionKey: false
});

// Indexes
chatHistorySchema.index({ userId: 1, isActive: 1 });
chatHistorySchema.index({ userId: 1, createdAt: -1 });

// Virtual for message count
chatHistorySchema.virtual("messageCount").get(function () {
    return this.messages?.length || 0;
});

// Method to add message
chatHistorySchema.methods.addMessage = function (role, content) {
    this.messages.push({
        role,
        content,
        timestamp: new Date()
    });
    return this.save();
};

// Method to get last N messages for context
chatHistorySchema.methods.getRecentMessages = function (limit = 20) {
    const messages = this.messages || [];
    return messages.slice(-limit);
};

// Static method to get user's conversations
chatHistorySchema.statics.getUserConversations = function (userId, limit = 20) {
    return this.find({ userId, isActive: true })
        .sort({ updatedAt: -1 })
        .limit(limit)
        .select("title createdAt updatedAt")
        .lean();
};

// Static method to create new conversation
chatHistorySchema.statics.createNewConversation = function (userId, title = "Cuộc trò chuyện mới") {
    return this.create({
        userId,
        title,
        messages: [{
            role: "system",
            content: `Bạn là trợ lý học tiếng Anh thông minh. Nhiệm vụ của bạn là:
1. Chỉ trả lời các câu hỏi liên quan đến học tiếng Anh (ngữ pháp, từ vựng, phát âm, v.v.)
2. Từ chối lịch sự các câu hỏi không liên quan đến học tập (chính trị, game, tin tức, v.v.)
3. Giải thích dễ hiểu, có ví dụ minh họa
4. Sử dụng tiếng Việt khi giải thích, tiếng Anh cho ví dụ
5. Khuyến khích người dùng học tập và thực hành`
        }]
    });
};

module.exports = model(DOCUMENT_NAME, chatHistorySchema);
