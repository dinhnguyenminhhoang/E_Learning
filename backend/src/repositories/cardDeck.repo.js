"use strict";

import { STATUS } from "../constants/status.constans";
import CardDeck from "../models/CardDeck";
const { default: mongoose } = require("mongoose");

export const getCardDeckById = async (cardDeckId) => {
  return await CardDeck.findById(new mongoose.Types.ObjectId(cardDeckId))
    .select("title description level thumbnail status target categories") // target để populate
    .populate("categories", "name")
    .populate("target", "name tags")
    .exec();
};

export const getCardDeckByName = async (name) => {
  return await CardDeck.findOne({ name });
};

export const createCardDeck = async (data) => {
  return await CardDeck.create(data);
};

export const updateCardDeck = async (cardDeckId, data) => {
  return await CardDeck.findByIdAndUpdate(
    new mongoose.Types.ObjectId(cardDeckId),
    data,
    { new: true }
  );
};

export const deleteCardDeck = async (cardDeckId) => {
  return await CardDeck.findByIdAndUpdate(
    new mongoose.Types.ObjectId(cardDeckId),
    { status: STATUS.DELETED }
  );
};

export const hardDeleteCardDeck = async (cardDeckId) => {
  return await CardDeck.findByIdAndDelete(
    new mongoose.Types.ObjectId(cardDeckId)
  );
};

export const getAllCardDeck = async (query = {}) => {
  
};
