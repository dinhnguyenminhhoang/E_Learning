"use strict";

const { Router } = require("express");
const userAdminController = require("../controllers/userAdmin.controller");
const { asynchandler } = require("../helpers/asyncHandler");
const auth = require("../middlewares/auth");

const router = Router();

// All routes require authentication
router.use(auth.authenticate);

// Get all users with pagination
router.get("/", asynchandler(userAdminController.getAllUsers));

// Get user by ID
router.get("/:userId", asynchandler(userAdminController.getUserById));

// Update user
router.put("/:userId", asynchandler(userAdminController.updateUser));

// Deactivate user (soft delete)
router.post("/:userId/deactivate", asynchandler(userAdminController.deactivateUser));

// Activate user (restore)
router.post("/:userId/activate", asynchandler(userAdminController.activateUser));

module.exports = router;
