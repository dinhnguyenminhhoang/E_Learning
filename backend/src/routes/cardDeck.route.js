const express = require("express");
const CardDeckController = require("../controllers/cardDeck.controller");
const { asynchandler } = require("../helpers/asyncHandler");
const validate = require("../middlewares/cardDeck");
const auth = require("../middlewares/auth");

const router = express.Router();

router.get(
  "/:cardDeckId",
  auth.authenticate,
  asynchandler(CardDeckController.getCardDeck)
);
router.post(
  "/",
  auth.authenticate,
  validate.validateCreateCardDeck,
  asynchandler(CardDeckController.createCardDeck)
);
router.put(
  "/:cardDeckId",
  auth.authenticate,
  validate.validateUpdateCardDeck,
  asynchandler(CardDeckController.updateCardDeck)
);
router.delete(
  "/:cardDeckId",
  auth.authenticate,
  asynchandler(CardDeckController.deleteCardDeck)
);
router.get(
  "/",
  auth.authenticate,
  asynchandler(CardDeckController.getListCardDecks)
);
router.get(
  "/category/:categoryId",
  auth.authenticate,
  asynchandler(CardDeckController.getCardDeckByCategory)
);

module.exports = router;
