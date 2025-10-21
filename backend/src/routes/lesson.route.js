const { Router } = require("express");
const lessonController = require("../controllers/lesson.controller");

const router = Router();
router.get("/", lessonController.getAllLessons);

module.exports = router;
