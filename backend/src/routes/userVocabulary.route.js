"use strict";

const express = require("express");
const router = express.Router();
const UserVocabularyController = require("../controllers/userVocabulary.controller");
const { authenticate } = require("../middlewares/auth");
const { asynchandler } = require("../helpers/asyncHandler");

router.get(
    "/my-words",
    authenticate,
    asynchandler(UserVocabularyController.getMyCustomWords)
);

router.post(
    "/my-words",
    authenticate,
    asynchandler(UserVocabularyController.createCustomWord)
);

router.put(
    "/my-words/:wordId",
    authenticate,
    asynchandler(UserVocabularyController.updateCustomWord)
);

router.delete(
    "/my-words/:wordId",
    authenticate,
    asynchandler(UserVocabularyController.deleteCustomWord)
);

router.get(
    "/bookmarks",
    authenticate,
    asynchandler(UserVocabularyController.getBookmarkedWords)
);

router.post(
    "/bookmarks/:wordId",
    authenticate,
    asynchandler(UserVocabularyController.toggleBookmark)
);

router.put(
    "/bookmarks/:wordId/notes",
    authenticate,
    asynchandler(UserVocabularyController.updateBookmarkNotes)
);

router.get(
    "/all",
    authenticate,
    asynchandler(UserVocabularyController.getAllVocabulary)
);

module.exports = router;
