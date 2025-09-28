const Category = require("../models/Category");

class CategoryRepository {
  async findById(id, options = {}) {
    return Category.findById(id, null, options).exec();
  }
}

module.exports = new CategoryRepository();
