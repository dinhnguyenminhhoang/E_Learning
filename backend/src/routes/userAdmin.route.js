"use strict";

const { Router } = require("express");
const userAdminController = require("../controllers/userAdmin.controller");
const { asynchandler } = require("../helpers/asyncHandler");
const auth = require("../middlewares/auth");
const { validateUpdateUserAdmin } = require("../middlewares/user.middleware");

const router = Router();

router.use(auth.authenticate);

router.get("/", asynchandler(userAdminController.getAllUsers));
router.get("/:userId", asynchandler(userAdminController.getUserById));
router.put("/:userId", asynchandler(userAdminController.updateUser));
router.post("/:userId/deactivate", asynchandler(userAdminController.deactivateUser));
router.post("/:userId/activate", asynchandler(userAdminController.activateUser));

// Update user
router.put(
  "/:userId",
  validateUpdateUserAdmin,
  asynchandler(userAdminController.updateUser)
);

// Deactivate user (soft delete)
router.post(
  "/:userId/deactivate",
  asynchandler(userAdminController.deactivateUser)
);

// Activate user (restore)
router.post(
  "/:userId/activate",
  asynchandler(userAdminController.activateUser)
);

module.exports = router;
