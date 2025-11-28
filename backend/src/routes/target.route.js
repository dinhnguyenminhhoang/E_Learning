const { Router } = require("express");
const targetController = require("../controllers/target.controller");
const {
  validateCreateTarget,
  validateUpdateTarget,
} = require("../middlewares/target");

const router = Router();

router.get("/get-all-targets", targetController.getAllTargets);

router.get("/unassigned", targetController.getUnassignedTargets);

router.post("/", validateCreateTarget, targetController.createTarget);

router.put(
  "/:targetId",
  validateUpdateTarget,
  targetController.updateTarget
);

router.delete("/:targetId", targetController.deleteTarget);

module.exports = router;