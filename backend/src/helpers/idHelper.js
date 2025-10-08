const mongoose = require("mongoose");

function toObjectId(id) {
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  return new mongoose.Types.ObjectId(id);
}

function isValid(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

module.exports = { toObjectId, isValid };
