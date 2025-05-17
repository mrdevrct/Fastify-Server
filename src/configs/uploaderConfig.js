const path = require("path");

const uploadRoot = path.join(__dirname, "../Uploads");
// Users
const userRoot = path.join(uploadRoot, "user");
const userImageDir = path.join(userRoot, "images");
// Tickets
const ticketRoot = path.join(uploadRoot, "ticket");
const ticketImageDir = path.join(ticketRoot, "images");
const ticketVideoDir = path.join(ticketRoot, "videos");
const ticketAudioDir = path.join(ticketRoot, "audios");
const ticketOtherDir = path.join(ticketRoot, "others");
// Articles
const articleRoot = path.join(uploadRoot, "article");
const articleImageDir = path.join(articleRoot, "images");
const articleVideoDir = path.join(articleRoot, "videos");
const articleAudioDir = path.join(articleRoot, "audios");
const articleOtherDir = path.join(articleRoot, "others");
// Products
const productRoot = path.join(uploadRoot, "product");
const productImageDir = path.join(productRoot, "images");
const productVideoDir = path.join(productRoot, "videos");
const productOtherDir = path.join(productRoot, "others");
// Festivals
const festivalRoot = path.join(uploadRoot, "festival");
const festivalImageDir = path.join(festivalRoot, "images");
const festivalOtherDir = path.join(festivalRoot, "others");

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
const allowedProductFileTypes = [...allowedImageTypes, ...allowedVideoTypes];
const allowedFestivalFileTypes = [...allowedImageTypes]; // فقط تصاویر برای جشنواره

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
  productRoot,
  productImageDir,
  productVideoDir,
  productOtherDir,
  allowedProductFileTypes,
  festivalRoot,
  festivalImageDir,
  festivalOtherDir,
  allowedFestivalFileTypes,
  maxFileSize,
};