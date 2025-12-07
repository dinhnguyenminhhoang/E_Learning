"use strict";

const UserAdminService = require("../services/userAdmin.service");
const ResponseBuilder = require("../types/response/baseResponse");

class UserAdminController {
    async getAllUsers(req, res) {
        try {
            const result = await UserAdminService.getAllUsers(req);
            res.status(result.code).json(result);
        } catch (error) {
            console.error("Error getting users:", error);
            res.status(500).json(ResponseBuilder.error("Internal server error", 500));
        }
    }

    async getUserById(req, res) {
        try {
            const result = await UserAdminService.getUserById(req.params.userId);
            res.status(result.code).json(result);
        } catch (error) {
            console.error("Error getting user:", error);
            res.status(500).json(ResponseBuilder.error("Internal server error", 500));
        }
    }

    async updateUser(req, res) {
        try {
            const result = await UserAdminService.updateUser(req.params.userId, req.body);
            res.status(result.code).json(result);
        } catch (error) {
            console.error("Error updating user:", error);
            res.status(500).json(ResponseBuilder.error("Internal server error", 500));
        }
    }

    async deactivateUser(req, res) {
        try {
            const result = await UserAdminService.deactivateUser(req.params.userId);
            res.status(result.code).json(result);
        } catch (error) {
            console.error("Error deactivating user:", error);
            res.status(500).json(ResponseBuilder.error("Internal server error", 500));
        }
    }

    async activateUser(req, res) {
        try {
            const result = await UserAdminService.activateUser(req.params.userId);
            res.status(result.code).json(result);
        } catch (error) {
            console.error("Error activating user:", error);
            res.status(500).json(ResponseBuilder.error("Internal server error", 500));
        }
    }
}

module.exports = new UserAdminController();
