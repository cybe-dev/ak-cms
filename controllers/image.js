"use strict";

const { response } = require("express");
const responseMock = require("../helpers/response-mock");
const uploader = require("../middlewares/upload");

module.exports.addImage = (req, res) => {
  const upload = uploader("image", "public/images/root");

  upload(req, res, (err) => {
    if (err) {
      responseMock.error(res, 400, "Upload failed");
      return;
    }

    responseMock.success(res, 200, "Upload success", {
      url: req.file.path,
    });
  });
};
