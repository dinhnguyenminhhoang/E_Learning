"use strict";

const RESPONSE_MESSAGES = require("../constants/responseMessage");
const categoryRepository = require("../repositories/category.repo");
const ResponseBuilder = require("../types/response/baseResponse");
const { STATUS } = require("../constants/status.constans");

class CategoryService {
  async createCategory(data) {
    const existingCategory = await categoryRepository.findByNameOrSlug(
      data.name,
      data.slug
    );
    if (existingCategory) {
      if (existingCategory.status === STATUS.DELETED) {
        data.status = STATUS.ACTIVE;
        const restored = await categoryRepository.updateById(
          existingCategory._id,
          data
        );
        return ResponseBuilder.success(RESPONSE_MESSAGES.SUCCESS.CREATED, {
          category: restored,
        });
      }
      return ResponseBuilder.duplicateError();
    }

    const newCategory = await categoryRepository.createCategory(data);
    return ResponseBuilder.success(RESPONSE_MESSAGES.SUCCESS.CREATED, {
      category: newCategory,
    });
  }

  async updateCategory(categoryId, data) {
    try {
      const existingCategory = await categoryRepository.findById(categoryId);

      if (!existingCategory) {
        return ResponseBuilder.notFoundError();
      }

      if (data.name && data.name !== existingCategory.name) {
        const existingCategoryWithName =
          await categoryRepository.getCategoryByName(data.name);

        if (existingCategoryWithName) {
          if (existingCategoryWithName.status === STATUS.DELETED) {
            await categoryRepository.deleteCategory(
              existingCategoryWithName._id
            );
          }
        }
      }
      const updateCategory = await categoryRepository.updateById(
        categoryId,
        data
      );
      return ResponseBuilder.success(RESPONSE_MESSAGES.SUCCESS.UPDATED, {
        category: updateCategory,
      });
    } catch (error) {
      console.error("❌ Error updating category:", error);
      return ResponseBuilder.RESPONSE_MESSAGES.ERROR.SERVER_ERROR;
    }
  }

  async getCategoryById(id) {
    const category = await categoryRepository.findById(id);
    if (!category || category.length === 0) {
      return ResponseBuilder.notFoundError();
    }
    return ResponseBuilder.success(RESPONSE_MESSAGES.SUCCESS.FETCHED, category);
  }

  async findAllCategories() {
    const categories = await categoryRepository.findCategories();
    if (!categories || categories.length === 0) {
      return ResponseBuilder.notFoundError();
    }
    return ResponseBuilder.success(RESPONSE_MESSAGES.SUCCESS.FETCHED, categories);
  }

  async deleteCategory(id) {
    const existingCardDeck = await categoryRepository.findById(id);
    if (!existingCardDeck) {
      return ResponseBuilder.notFoundError();
    }
    await categoryRepository.softDelete(id);
    return ResponseBuilder.success(RESPONSE_MESSAGES.SUCCESS.DELETED);
  }
}

module.exports = new CategoryService();
