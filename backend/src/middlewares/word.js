const { createValidator } = require("../utils/validate/common");
const { createWordSchema } = require("../utils/validate/word");

module.exports = {
  validateCreateWord: createValidator(createWordSchema),
};
