const path = require("path");

const generateFileName = (prefix, username, refId, fileExtension) => {
  const now = new Date();
  const pad = (n) => n.toString().padStart(2, "0");
  const dateTimeString = [
    now.getFullYear(),
    pad(now.getMonth() + 1),
    pad(now.getDate()),
    pad(now.getHours()),
    pad(now.getMinutes()),
    pad(now.getSeconds()),
  ].join("");

  return `${prefix}-${username}-${refId}-${dateTimeString}.${fileExtension}`;
};

const getTicketFileDir = (mimetype, config) => {
  if (config.allowedImageTypes.includes(mimetype)) {
    return { dir: config.ticketImageDir, subPath: "images" };
  } else if (config.allowedAudioTypes.includes(mimetype)) {
    return { dir: config.ticketAudioDir, subPath: "audios" };
  } else if (config.allowedVideoTypes.includes(mimetype)) {
    return { dir: config.ticketVideoDir, subPath: "videos" };
  } else {
    return { dir: config.ticketOtherDir, subPath: "others" };
  }
};

const getArticleFileDir = (mimetype, config) => {
  if (config.allowedImageTypes.includes(mimetype)) {
    return { dir: config.articleImageDir, subPath: "images" };
  } else if (config.allowedAudioTypes.includes(mimetype)) {
    return { dir: config.articleAudioDir, subPath: "audios" };
  } else if (config.allowedVideoTypes.includes(mimetype)) {
    return { dir: config.articleVideoDir, subPath: "videos" };
  } else {
    return { dir: config.articleOtherDir, subPath: "others" };
  }
};

module.exports = {
  generateFileName,
  getTicketFileDir,
  getArticleFileDir,
};
