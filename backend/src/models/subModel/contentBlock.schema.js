const mongoose = require("mongoose");
const { STATUS } = require("../../constants/status.constans");
const { Schema, model } = mongoose;

const SKILL_ENUM = ["listening", "speaking", "reading", "writing"];
const LEVEL_ENUM = ["beginner", "intermediate", "advanced"];
const BLOCK_TYPE_ENUM = ["vocabulary", "grammar", "quiz", "media"];

const ContentBlockSchema = new Schema(  
  {
    type: {
      type: String,
      required: true,
      enum: BLOCK_TYPE_ENUM,
    },
    title: { type: String, trim: true },
    description: { type: String, trim: true },
    skill: { type: String, enum: SKILL_ENUM, required: true },
    difficulty: { type: String, enum: LEVEL_ENUM, default: "beginner" },
    lessonId: { type: Schema.Types.ObjectId, ref: "Lesson" },
    status:{ type: String, enum: Object.values(STATUS), default: STATUS.ACTIVE }
  },
  {
    timestamps: true,
    discriminatorKey: "type",
  }
);

const ContentBlock = model("ContentBlock", ContentBlockSchema);
module.exports = ContentBlock;
