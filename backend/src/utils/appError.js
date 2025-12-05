class AppError extends Error {
  constructor(message, code) {
    super(message);
    this.code = code;
    this.name = "AppError";
  }
}

module.exports = AppError;
