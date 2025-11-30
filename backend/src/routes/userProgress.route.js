const { Router } = require("express");
const blockController = require("../controllers/block.controller");
const { asynchandler } = require("../helpers/asyncHandler");
const { authenticate } = require("../middlewares/auth");
const userProgressController = require("../controllers/userProgress.controller");

const router = Router();
router.get(
  "/lessons/:lessonId",
  authenticate,
  asynchandler(userProgressController.getUserProgress)
);

module.exports = router;