const path = require("path");

const uploadRoot = path.join(__dirname, "../../Uploads");
const userRoot = path.join(uploadRoot, "user");
const userImageDir = path.join(userRoot, "images");
const ticketRoot = path.join(uploadRoot, "ticket");
const ticketImageDir = path.join(ticketRoot, "images");
const ticketVideoDir = path.join(ticketRoot, "videos");
const ticketAudioDir = path.join(ticketRoot, "audios");
const ticketOtherDir = path.join(ticketRoot, "others");
const articleRoot = path.join(uploadRoot, "article");
const articleImageDir = path.join(articleRoot, "images");
const articleVideoDir = path.join(articleRoot, "videos");
const articleAudioDir = path.join(articleRoot, "audios");
const articleOtherDir = path.join(articleRoot, "others");

const allowedImageTypes = ["image/jpeg", "image/png", "image/gif"];
const allowedAudioTypes = ["audio/mpeg", "audio/wav"];
const allowedVideoTypes = ["video/mp4", "video/mpeg"];
const allowedTicketFileTypes = [
  ...allowedImageTypes,
  ...allowedAudioTypes,
  ...allowedVideoTypes,
];
const allowedArticleFileTypes = [
  ...allowedTicketFileTypes,
  "application/pdf",
  "text/plain",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
const maxFileSize = 20 * 1024 * 1024; // 20MB

module.exports = {
  uploadRoot,
  userRoot,
  userImageDir,
  ticketRoot,
  ticketImageDir,
  ticketVideoDir,
  ticketAudioDir,
  ticketOtherDir,
  articleRoot,
  articleImageDir,
  articleVideoDir,
  articleAudioDir,
  articleOtherDir,
  allowedImageTypes,
  allowedAudioTypes,
  allowedVideoTypes,
  allowedTicketFileTypes,
  allowedArticleFileTypes,
  maxFileSize,
};
