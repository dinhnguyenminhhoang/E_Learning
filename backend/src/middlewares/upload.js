// middleware/upload.js
const multer = require("multer");

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
      file.mimetype === "application/vnd.ms-excel"
    ) {
      cb(null, true);
    } else {
      cb(new Error("Chỉ chấp nhận file Excel (.xls, .xlsx)"));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // Giới hạn kích thước file 5MB
});

module.exports = upload;
