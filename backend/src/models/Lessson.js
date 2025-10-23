const mongoose = require("mongoose");
const { STATUS } = require("../constants/status.constans");
const { Schema, model } = mongoose;

const SKILL_ENUM = ["listening", "speaking", "reading", "writing"];
const LEVEL_ENUM = ["beginner", "intermediate", "advanced"];

const LessonSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 255,
      unique: true,
    },
    description: { type: String, trim: true },
    skill: { type: String, enum: SKILL_ENUM, required: true },
    topic: { type: String, required: true, trim: true, maxlength: 100 },
    level: { type: String, enum: LEVEL_ENUM, required: true },
    duration_minutes: { type: Number, min: 1, default: 30 },
    order: { type: Number, default: 0 },
    thumbnail: { type: String, trim: true },
    prerequisites: [{ type: Schema.Types.ObjectId, ref: "Lesson" }],
    status: { type: String, enum: STATUS, default: STATUS.ACTIVE },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
      index: true,
    },
    blocks: [
      {
        block: { type: Schema.Types.ObjectId, ref: "ContentBlock" },
        exercise: { type: Schema.Types.ObjectId, ref: "Quiz", default: null },
        order: { type: Number, default: 0 },
      },
    ],
  },
  { timestamps: true }
);

const Lesson = model("Lesson", LessonSchema);

module.exports = Lesson;
