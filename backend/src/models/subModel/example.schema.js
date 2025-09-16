"use strict";
const { Schema } = require("mongoose");

const exampleSchema = new Schema({
    sentence: { type: String, required: true },
    translation: { type: String, required: true },
    audio: { type: String },
}, { _id: false });
module.exports = exampleSchema