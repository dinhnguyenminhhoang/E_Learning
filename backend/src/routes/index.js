"use strict";
const express = require("express");
const router = express.Router();

router.use(`/v1/api/user`, require("./auth.route"));
router.use(`/v1/api/category`, require("./category.route"));
module.exports = router;
