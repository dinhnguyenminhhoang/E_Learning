const { toObjectId } = require("../helpers/idHelper");
const lessonBlockHelper = require("../helpers/lessonBlock.helper");
const BlockRepository = require("../repositories/block.repo");
const ResponseBuilder = require("../types/response/baseResponse");
const { default: AppError } = require("../utils/appError");
class BlockService {
  async existingBlock(blockId) {
    const block = await BlockRepository.getBlockById(toObjectId(blockId));
    if (!block) {
      throw new AppError("Block not found.", 404);
    }
    return block;
  }
  async getBlockById(req) {
    const { blockId } = req.params;
    const block = await this.existingBlock(blockId);
    return ResponseBuilder.success({
      message: "Fetched block successfully",
      data: block,
    });
  }

  async createBlockContent(req) {
    const block = req.body;
    const createdBlock = await BlockRepository.create(block);
    return ResponseBuilder.success({
      message: "Block created successfully",
      data: createdBlock,
    });
  }

  async updateBlockContent(req) {
    const { blockId } = req.params;
    const blockUpdates = req.body;
    const existingBlock = await this.existingBlock(blockId);
    if (existingBlock.order !== blockUpdates.order) {
      await lessonBlockHelper.checkOrderExists(
        existingBlock,
        blockUpdates.order
      );
    }

    const updatedBlock = await BlockRepository.update(
      toObjectId(blockId),
      blockUpdates
    );
    return ResponseBuilder.success({
      message: "Block updated successfully",
      data: updatedBlock,
    });
  }

  async deleteBlockContent(req) {
    const { blockId } = req.params;
    await this.existingBlock(blockId);
    try {
      await lessonBlockHelper.deleteBlockFromLesson(blockId);
      await BlockRepository.softDelete(toObjectId(blockId));
      return ResponseBuilder.success("Block deleted successfully");
    } catch (error) {
      throw new AppError("Failed to remove block from lesson.", 500);
    }
  }
}
module.exports = new BlockService();
