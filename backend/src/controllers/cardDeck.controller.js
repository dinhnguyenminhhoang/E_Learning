"use strict";

const CardDeckService = require("../services/cardDeck.service");

const CardDeckController = {
  async getCardDeck(req, res) {
    const response = await CardDeckService.getCardDeck(req);
    res.status(response.code).json(response);
  },

  async createCardDeck(req, res) {
    const response = await CardDeckService.createCardDeck(req);
    res.status(response.code).json(response);
  },

  async updateCardDeck(req, res) {
    const response = await CardDeckService.updateCardDeck(req);
    res.status(response.code).json(response);
  },

  async deleteCardDeck(req, res) {
    const response = await CardDeckService.deleteCardDeck(req);
    res.status(response.code).json(response);
  },

  async getListCardDecks(req, res) {
    const response = await CardDeckService.getListCardDecks(req);
    res.status(response.code).json(response);
  },

  async getCardDeckByCategory(req, res) {
    const response = await CardDeckService.getCardDeckByCategory(req);
    res.status(response.code).json(response);
  },
};

module.exports = CardDeckController;
