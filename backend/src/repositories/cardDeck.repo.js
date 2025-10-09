"use strict";

const mongoose = require("mongoose");
const CardDeck = require("../models/CardDeck");
const { STATUS } = require("../constants/status.constans");

const getCardDeckById = async (cardDeckId) => {
  return await CardDeck.findById(new mongoose.Types.ObjectId(cardDeckId))
    .select("title description level thumbnail status target categoryId")
    .populate("categories", "name")
    .populate("target", "name tags")
    .exec();
};

const getCardDeckByTitle = async (title) => {
  return await CardDeck.findOne({ title });
};

const createCardDeck = async (data) => {
  return await CardDeck.create(data);
};

const updateCardDeck = async (cardDeckId, data) => {
  return await CardDeck.findByIdAndUpdate(
    new mongoose.Types.ObjectId(cardDeckId),
    data,
    { new: true }
  );
};

const deleteCardDeck = async (cardDeckId) => {
  return await CardDeck.findByIdAndUpdate(
    new mongoose.Types.ObjectId(cardDeckId),
    { status: STATUS.DELETED }
  );
};

const hardDeleteCardDeck = async (cardDeckId) => {
  return await CardDeck.findByIdAndDelete(
    new mongoose.Types.ObjectId(cardDeckId)
  );
};

const getAllCardDeck = async (query = {}) => {
  const { pageNum = 1, pageSize = 10, target, level, category, search } = query;

  const filter = { status: { $ne: STATUS.DELETED } };

  if (target) filter.target = target;
  if (level) filter.level = level;
  if (category) filter.categoryId = category;

  if (search && search.trim() !== "") {
    filter.$text = { $search: search.trim() };
  }

  const total = await CardDeck.countDocuments(filter);
  const decks = await CardDeck.find(filter)
    .populate("target", "name")
    .populate("categoryId", "name")
    .sort(search ? { score: { $meta: "textScore" } } : { createdAt: -1 })
    .skip((pageNum - 1) * pageSize)
    .limit(pageSize)
    .lean();

  return {
    total,
    pageNum: Number(pageNum),
    pageSize: Number(pageSize),
    decks,
  };
};

const findByCategory = async (categoryId) => {
  return await CardDeck.find({ categoryId: categoryId, status: STATUS.ACTIVE })
    .select("title description level thumbnail status target categoryId")
    .populate("categoryId", "name")
    .populate("target", "name tags")
    .exec();
};

module.exports = {
  getCardDeckById,
  getCardDeckByTitle,
  createCardDeck,
  updateCardDeck,
  deleteCardDeck,
  hardDeleteCardDeck,
  getAllCardDeck,
  findByCategory,
};
