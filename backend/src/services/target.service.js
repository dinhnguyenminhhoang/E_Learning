const { toObjectId } = require("../helpers/idHelper");
const targetRepo = require("../repositories/target.repo");
const ResponseBuilder = require("../types/response/baseResponse");
class TartgetService {
  _normalizePayload(payload = {}) {
    return {
      name: payload.name?.trim(),
      description: payload.description?.trim(),
      key: payload.key?.trim()?.toUpperCase(),
      tag: payload.tag?.trim(),
    };
  }

  _buildTargetDocument(payload) {
    const doc = {
      name: payload.name,
      key: payload.key,
      tags: [payload.tag.toLowerCase()],
    };

    if (payload.description) {
      doc.description = payload.description;
    }

    return doc;
  }

  async getAllTargets(req) {
    const result = await targetRepo.findAllTargets(req);
    return ResponseBuilder.successWithPagination(
      "Lấy danh sách mục tiêu thành công.",
      result.targets,
      {
        pageNum: parseInt(req.query.pageNum) || 1,
        pageSize: parseInt(req.query.pageSize) || 10,
        total: result.total,
      }
    );
  }

  async createTarget(req) {
    const normalizedPayload = this._normalizePayload(req.body);

    const existingTarget = await targetRepo.getTargetByKey(
      normalizedPayload.key
    );

    if (existingTarget) {
      return ResponseBuilder.duplicateError(
        "Mục tiêu với khóa này đã tồn tại."
      );
    }
    const newTarget = await targetRepo.create(
      this._buildTargetDocument(normalizedPayload)
    );

    return ResponseBuilder.success("Tạo mục tiêu thành công.", newTarget);
  }

  async updateTarget(req) {
    const { targetId } = req.params;
    if (!targetId) {
      return ResponseBuilder.badRequest("Thiếu targetId.");
    }

    const normalizedPayload = this._normalizePayload(req.body);

    const target = await targetRepo.findById(toObjectId(targetId));
    if (!target) {
      return ResponseBuilder.notFoundError("Không tìm thấy mục tiêu.");
    }

    if (normalizedPayload.key !== target.key) {
      const targetWithSameKey = await targetRepo.getTargetByKey(
        normalizedPayload.key
      );
      if (targetWithSameKey && targetWithSameKey._id.toString() !== targetId) {
        return ResponseBuilder.duplicateError(
          "Key này đã được sử dụng cho mục tiêu khác."
        );
      }
    }

    const updatedTarget = await targetRepo.updateById(
      targetId,
      this._buildTargetDocument(normalizedPayload)
    );

    if (!updatedTarget) {
      return ResponseBuilder.notFoundError("Không tìm thấy mục tiêu.");
    }

    return ResponseBuilder.success(
      "Cập nhật mục tiêu thành công.",
      updatedTarget
    );
  }

  async deleteTarget(req) {
    const { targetId } = req.params;
    if (!targetId) {
      return ResponseBuilder.badRequest("Thiếu targetId.");
    }

    const target = await targetRepo.findById(toObjectId(targetId));
    if (!target) {
      return ResponseBuilder.notFoundError("Không tìm thấy mục tiêu.");
    }

    await targetRepo.softDelete(toObjectId(targetId));

    return ResponseBuilder.success("Xóa mục tiêu thành công.", {
      id: targetId,
    });
  }
}
module.exports = new TartgetService();
