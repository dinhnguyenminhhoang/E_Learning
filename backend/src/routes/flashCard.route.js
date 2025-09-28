"use strict";

const express = require("express");
const { asynchandler } = require("../helpers/asyncHandler");
const auth = require("../middlewares/auth");
const flashcardController = require("../controllers/flashcard.controller");

const router = express.Router();

router
  .route("/")
  .get(asynchandler(flashcardController.list))
  .post(auth.adminOnly, asynchandler(flashcardController.create));

router
  .route("/:id")
  .get(asynchandler(flashcardController.getOne))
  .patch(auth.adminOnly, asynchandler(flashcardController.update))
  .delete(auth.adminOnly, asynchandler(flashcardController.delete));

module.exports = router;
