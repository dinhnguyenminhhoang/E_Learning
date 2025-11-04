const RESPONSE_MESSAGES = require("../../constants/responseMessage");
const HTTP_STATUS = require("../../constants/httpStatus");

class ResponseBuilder {
  static success(message, data = null, code = HTTP_STATUS.OK) {
    return {
      status: "success",
      message,
      data,
      code,
      timestamp: new Date().toISOString(),
    };
  }
  static badRequest(message, data = null, code = HTTP_STATUS.BAD_REQUEST) {
    return {
      status: "bad request",
      message,
      data,
      code,
      timestamp: new Date().toISOString(),
    };
  }
  static successWithPagination(
    message,
    data = [],
    pagination = {},
    code = HTTP_STATUS.OK
  ) {
    return {
      status: "success",
      message,
      data,
      pagination: {
        total: pagination.total ?? 0,
        pageNum: pagination.pageNum ?? 1,
        pageSize: pagination.pageSize ?? 10,
        total: pagination.total ?? 0,
      },
      code,
      timestamp: new Date().toISOString(),
    };
  }

  static error(
    message,
    code = HTTP_STATUS.INTERNAL_SERVER_ERROR,
    errors = null
  ) {
    const response = {
      status: "error",
      message,
      code,
      timestamp: new Date().toISOString(),
    };

    if (errors) {
      response.errors = errors;
    }

    return response;
  }

  static validationError(errors) {
    return this.error(
      RESPONSE_MESSAGES.ERROR.VALIDATION_FAILED,
      HTTP_STATUS.BAD_REQUEST,
      errors
    );
  }

  static duplicateError(message = "Duplicate resource") {
    return this.error(
      message,
      HTTP_STATUS.CONFLICT
    );
  }

  static notFoundError(message = "Resource not found") {
    return this.error(
      message,
      HTTP_STATUS.NOT_FOUND
    );
  }

  static unauthorizedError() {
    return this.error(
      RESPONSE_MESSAGES.ERROR.UNAUTHORIZED,
      HTTP_STATUS.UNAUTHORIZED
    );
  }

  static forbiddenError() {
    return this.error(RESPONSE_MESSAGES.ERROR.FORBIDDEN, HTTP_STATUS.FORBIDDEN);
  }
}

module.exports = ResponseBuilder;
