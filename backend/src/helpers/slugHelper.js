"use strict";

const slugify = require("slugify");

async function generateUniqueSlug(text, model, excludeId = null) {
  let baseSlug = slugify(text, {
    lower: true,
    strict: true,
    locale: "en",
  });

  let slugExists = await model.findOne({ slug: baseSlug });
  let counter = 1;
  let newSlug = baseSlug;

  while (slugExists && (!excludeId || slugExists._id.toString() !== excludeId.toString())) {
    newSlug = `${baseSlug}-${counter}`;
    slugExists = await model.findOne({ slug: newSlug });
    counter++;
  }

  return newSlug;
}

function generateSlug(text) {
  return slugify(text, {
    lower: true,
    strict: true,
    locale: "en",
  });
}

module.exports = {
  generateUniqueSlug,
  generateSlug,
};
