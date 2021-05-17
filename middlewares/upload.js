"use strict";

const multer = require("multer");
const path = require("path");

const pathTo = (destination) => {
  return multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, destination);
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(
        null,
        file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
      );
    },
  });
};

const allowExtensionRegex = (regex) => {
  return (req, file, cb) => {
    if (file.originalname.match(regex)) {
      cb(null, true);
    } else {
      cb(new Error("Only images allowed"));
    }
  };
};

const uploader = (name, path, multiple = false, limit = 3) => {
  const storage = pathTo(path);
  const fileFilter = allowExtensionRegex(/[\/.](gif|jpg|jpeg|tiff|png)$/i);
  if (multiple) {
    if (Array.isArray(name)) {
      console.log("pake yang ini");
      return multer({ storage, fileFilter }).fields(name);
    }
    return multer({ storage, fileFilter }).array(name, limit);
  }
  return multer({ storage, fileFilter }).single(name);
};

module.exports = uploader;
