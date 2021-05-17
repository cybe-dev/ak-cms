"use strict";
const { basicInformation } = require("../form-mapping.json");
const responseMock = require("../helpers/response-mock");
const upload = require("../middlewares/upload");
const db = require("../models");
const { basic_information } = db;
const fs = require("fs");
const multer = require("multer");

const storeUpload = (data = []) => {
  try {
    for (const file of data) {
      fs.renameSync(file.before, file.after);
      if (file.remove && fs.existsSync(file.remove)) {
        fs.unlinkSync(file.remove);
      }
    }
  } catch (e) {
    return false;
  }

  return true;
};

module.exports.index = (req, res) => {
  basic_information
    .findAll({})
    .then((result) => {
      const returning = {};
      for (const field of result) {
        returning[field.key] = field.value;
      }

      responseMock.success(res, 200, "Basic Information has showed", returning);
    })
    .catch((e) => {
      responseMock.error(res);
    });
};
module.exports.update = (req, res) => {
  basic_information
    .findAll()
    .then((resultDataBefore) => {
      const dataBefore = {};
      for (const data of resultDataBefore) {
        dataBefore[data.key] = data.value;
      }
      let uploader;
      if (basicInformation.find((predicate) => predicate.type === "upload")) {
        const name = [];
        for (const searchUpload of basicInformation) {
          if (searchUpload.type === "upload") {
            name.push({ name: searchUpload.key, maxCount: 1 });
          }
        }
        uploader = upload(name, "public/images/temp", true);
      } else {
        uploader = multer().none();
      }

      uploader(req, res, async (err) => {
        if (err) {
          responseMock.error(res, 400, "Upload error");
          return;
        }

        let result;
        try {
          const data = [];
          const dataServe = {};
          const uploadIt = [];
          for (const form of basicInformation) {
            if (form.type === "upload" && req.files) {
              if (Array.isArray(req.files[form.key])) {
                const before = req.files[form.key][0];
                const after = "public/images/basic/" + before.filename;
                uploadIt.push({
                  before: before.path,
                  after,
                  remove: dataBefore[form.key],
                });
                data.push({
                  key: form.key,
                  value: after,
                });
                dataServe[form.key] = after;
              }
            } else {
              data.push({
                key: form.key,
                value: req.body[form.key],
              });
              dataServe[form.key] = req.body[form.key];
            }
          }

          result = await db.sequelize.transaction(async (t) => {
            const returning = await basic_information.bulkCreate(data, {
              updateOnDuplicate: ["value"],
              transaction: t,
            });
            if (storeUpload(uploadIt)) {
              return dataServe;
            } else {
              throw new Error("Upload error");
            }
          });
        } catch (e) {
          responseMock.error(res);
          return;
        }

        responseMock.success(
          res,
          200,
          "Basic information has been updated",
          result
        );
      });
    })
    .catch((e) => {
      responseMock.error(res);
    });
};
