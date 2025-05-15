require("dotenv").config();

const config = {
  port: process.env.PORT || 8080,
  mongodbUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
  upload_max_file_size_mb: process.env.UPLOAD_MAX_FILE_SIZE_MB,
  upload_max_file_count: process.env.UPLOAD_MAX_FILE_COUNT,
};

module.exports = { config };
