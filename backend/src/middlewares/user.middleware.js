"use strict";

const { createValidator } = require("../utils/validate/common");
const {
  updateProfileSchema,
  updateAvatarSchema,
  updateUserAdminSchema,
} = require("../utils/validate/user");

module.exports = {
  validateUpdateProfile: createValidator(updateProfileSchema),
  validateUpdateAvatar: createValidator(updateAvatarSchema),
  validateUpdateUserAdmin: createValidator(updateUserAdminSchema),
};
