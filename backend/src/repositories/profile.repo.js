"use strict";

const User = require("../models/User");
const { toObjectId } = require("../helpers/idHelper");

class ProfileRepository {
    async getProfile(userId) {
        return await User.findById(toObjectId(userId))
            .select("name email phoneNumber profile statistics createdAt onboardingStatus")
            .lean();
    }

    async updateProfile(userId, updateData) {
        return await User.findByIdAndUpdate(
            toObjectId(userId),
            { $set: updateData },
            { new: true, runValidators: true }
        )
            .select("name email phoneNumber profile statistics createdAt")
            .lean();
    }

    async updateAvatar(userId, avatarUrl) {
        return await User.findByIdAndUpdate(
            toObjectId(userId),
            { $set: { "profile.avatar": avatarUrl } },
            { new: true }
        )
            .select("profile.avatar")
            .lean();
    }

    async getLearningPreferences(userId) {
        const user = await User.findById(toObjectId(userId))
            .select("profile.learningPreferences")
            .lean();
        return user?.profile?.learningPreferences || null;
    }

    async updateLearningPreferences(userId, preferences) {
        const updateFields = {};
        if (preferences.dailyGoal !== undefined) {
            updateFields["profile.learningPreferences.dailyGoal"] = preferences.dailyGoal;
        }
        if (preferences.studyReminder !== undefined) {
            updateFields["profile.learningPreferences.studyReminder"] = preferences.studyReminder;
        }
        if (preferences.preferredStudyTime !== undefined) {
            updateFields["profile.learningPreferences.preferredStudyTime"] = preferences.preferredStudyTime;
        }
        if (preferences.difficultyLevel !== undefined) {
            updateFields["profile.learningPreferences.difficultyLevel"] = preferences.difficultyLevel;
        }

        return await User.findByIdAndUpdate(
            toObjectId(userId),
            { $set: updateFields },
            { new: true }
        )
            .select("profile.learningPreferences")
            .lean();
    }
}

module.exports = new ProfileRepository();
