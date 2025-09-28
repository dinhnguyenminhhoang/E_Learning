"use strict";
const express = require("express");
const router = express.Router();

router.use(`/v1/api/user`, require("./auth.route"));
router.use(`/v1/api/category`, require("./category.route"));
router.use(`/v1/api/flashcard`, require("./flashCard.route"));
module.exports = router;
