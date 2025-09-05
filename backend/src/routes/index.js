"use strict";
const express = require("express");
const router = express.Router();

router.use(`/v1/api/user`, require("./auth.route"));
module.exports = router;
