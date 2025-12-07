"use strict";

const User = require("../models/User");
const UserRepository = require("../repositories/user.repo");
const ResponseBuilder = require("../types/response/baseResponse");
const RESPONSE_MESSAGES = require("../constants/responseMessage");

class UserAdminService {
    async getAllUsers(req) {
        const { pageNum = 1, pageSize = 50, search, role, status } = req.query;

        const page = parseInt(pageNum);
        const limit = parseInt(pageSize);
        const skip = (page - 1) * limit;

        const query = {};

        if (role && role !== 'all') {
            query.roles = role;
        }

        if (status && status !== 'all') {
            query.status = status;
        }

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
            ];
        }

        const [users, total] = await Promise.all([
            User.find(query)
                .select('-password -refreshToken -resetPasswordToken -resetPasswordExpires')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            User.countDocuments(query),
        ]);

        // Transform data
        const transformedUsers = users.map(user => ({
            _id: user._id,
            name: user.name || '',
            email: user.email,
            role: user.roles?.[0] || 'user',
            status: user.status || 'active',
            learningPathsCount: user.learningPaths?.length || 0,
            createdAt: user.createdAt,
            lastLoginAt: user.lastLoginAt,
            avatar: user.avatar,
            isEmailVerified: user.isEmailVerified,
        }));

        return ResponseBuilder.successWithPagination(
            RESPONSE_MESSAGES.SUCCESS.FETCHED,
            transformedUsers,
            {
                total,
                pageNum: page,
                pageSize: limit,
            }
        );
    }

    async getUserById(userId) {
        const user = await UserRepository.findById(userId, {
            select: '-password -refreshToken -resetPasswordToken -resetPasswordExpires',
        });

        if (!user) {
            return ResponseBuilder.notFoundError("User not found");
        }

        const userData = {
            _id: user._id,
            name: user.name || '',
            email: user.email,
            role: user.roles?.[0] || 'user',
            status: user.status || 'active',
            learningPathsCount: user.learningPaths?.length || 0,
            learningPaths: user.learningPaths || [],
            createdAt: user.createdAt,
            lastLoginAt: user.lastLoginAt,
            avatar: user.avatar,
            loginAttempts: user.loginAttempts,
            isEmailVerified: user.isEmailVerified,
            onboardingStatus: user.onboardingStatus,
        };

        return ResponseBuilder.success(RESPONSE_MESSAGES.SUCCESS.FETCHED, userData);
    }

    async updateUser(userId, updateData) {
        const user = await UserRepository.findById(userId);
        if (!user) {
            return ResponseBuilder.notFoundError("User not found");
        }

        // Only allow certain fields to be updated
        const allowedFields = ['name', 'status', 'roles', 'avatar'];
        const filteredData = {};
        for (const key of allowedFields) {
            if (updateData[key] !== undefined) {
                filteredData[key] = updateData[key];
            }
        }

        // Handle role update
        if (updateData.role) {
            filteredData.roles = [updateData.role];
        }

        const updatedUser = await UserRepository.updateById(userId, filteredData);

        return ResponseBuilder.success(RESPONSE_MESSAGES.SUCCESS.UPDATED, {
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.roles?.[0] || 'user',
            status: updatedUser.status,
        });
    }

    async deactivateUser(userId) {
        const user = await UserRepository.findById(userId);
        if (!user) {
            return ResponseBuilder.notFoundError("User not found");
        }

        await UserRepository.softDelete(userId);
        return ResponseBuilder.success("User deactivated successfully", null);
    }

    async activateUser(userId) {
        const user = await UserRepository.findById(userId, { includeDeleted: true });
        if (!user) {
            return ResponseBuilder.notFoundError("User not found");
        }

        const restoredUser = await UserRepository.restore(userId);
        return ResponseBuilder.success("User activated successfully", {
            _id: restoredUser._id,
            status: restoredUser.status,
        });
    }
}

module.exports = new UserAdminService();
