"use strict";

const express = require("express");
const authController = require("../controllers/auth.controller");
const { asynchandler } = require("../helpers/asyncHandler");
const router = express.Router();

/**
 * @swagger
 * paths:
 *   /v1/api/user/signup:
 *     $ref: '#/components/authPaths/signup'
 */
router.post("/signup", asynchandler(authController.singUp));

/**
 * @swagger
 * paths:
 *   /v1/api/user/signin:
 *     $ref: '#/components/authPaths/signin'
 */
router.post("/signin", asynchandler(authController.signIn));

/**
 * @swagger
 * paths:
 *   /v1/api/user/refresh-token:
 *     $ref: '#/components/authPaths/refreshToken'
 */
router.post("/refresh-token", authController.refreshToken);

/**
 * @swagger
 * paths:
 *   /v1/api/user/signout:
 *     $ref: '#/components/authPaths/signout'
 */
router.post("/signout", authController.signOut);

/**
 * @swagger
 * paths:
 *   /v1/api/user/forgot-password:
 *     $ref: '#/components/authPaths/forgotPassword'
 */
router.post("/forgot-password", authController.forgotPassword);
/**
 * @swagger
 * paths:
 *   /v1/api/user/verify-email:
 *     $ref: '#/components/authPaths/verifyEmail'
 */
router.get("/verify-email", authController.verifyEmail);
/**
 * @swagger
 * paths:
 *   /v1/api/user/reset-password:
 *     $ref: '#/components/authPaths/resetPassword'
 */
router.post("/reset-password", authController.resetPassword);

router.post('/google', authController.googleLogin);


module.exports = router;
