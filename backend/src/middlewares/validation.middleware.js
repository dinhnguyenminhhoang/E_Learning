"use strict";

const { createValidator } = require("../utils/validate/common");

/**
 * Generic validation middleware factory
 * This is a re-export of the createValidator function for convenience
 *
 * Usage:
 * const { validate } = require('../middlewares/validation.middleware');
 * const mySchema = Joi.object({ ... });
 * router.post('/endpoint', validate(mySchema), controller);
 */

module.exports = {
  validate: createValidator,
};
