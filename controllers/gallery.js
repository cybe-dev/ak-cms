"use strict";

const responseMock = require("../helpers/response-mock");
const uploader = require("../middlewares/upload");
const db = require("../models");
const fs = require("fs");

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

module.exports.indexByType = (req, res) => {
  const { type } = req.params;
  const { offset = 0, limit = 20 } = req.query;

  db.gallery
    .findAndCountAll({
      where: {
        "$post.postType$": type,
      },
      order: [["createdAt", "ASC"]],
      offset: parseInt(offset),
      limit: parseInt(limit) > 50 ? 50 : parseInt(limit),
      include: [
        {
          model: db.post,
          as: "post",
          attributes: ["id", "text", "title", "slug"],
        },
      ],
      group: ["postId"],
    })
    .then((result) => {
      responseMock.success(res, 200, "Gallery showed successfully", {
        count: result.count.length,
        rows: result.rows,
      });
    })
    .catch((e) => {
      console.log(e);
      responseMock.error(res);
    });
};

module.exports.destroy = (req, res) => {
  const { id } = req.params;

  db.gallery
    .findByPk(id)
    .then(async (result) => {
      if (result) {
        try {
          await db.sequelize.transaction(async (t) => {
            await result.destroy({ transaction: t });
            if (fs.existsSync(result.path)) fs.unlinkSync(result.path);
            return;
          });
        } catch (e) {
          responseMock.error(res);
          return;
        }

        responseMock.success(res, 200, "Gallery has been deleted", result);
      } else {
        responseMock.error(res, "404", "Gallery not found");
      }
    })
    .catch((e) => {
      responseMock.error(res);
    });
};

module.exports.indexByPost = (req, res) => {
  const { id } = req.params;
  const { offset = 0, limit = 20 } = req.query;

  db.gallery
    .findAndCountAll({
      where: {
        postId: id,
      },
      order: [["createdAt", "DESC"]],
      offset: parseInt(offset),
      limit: parseInt(limit) > 50 ? 50 : parseInt(limit),
    })
    .then((result) => {
      responseMock.success(res, 200, "Gallery successfully showed", result);
    })
    .catch((e) => {
      responseMock.error(res);
    });
};

module.exports.post = (req, res) => {
  const { id } = req.params;
  const upload = uploader("gallery", "public/images/temp", true, 10);

  db.post
    .findByPk(id)
    .then((result) => {
      if (result) {
        upload(req, res, async (err) => {
          if (err) {
            responseMock.error(res, 400, "Upload error");
            return;
          }

          if (!req.files || req.files.length < 1) {
            responseMock.error(res, 400, "Nothing file uploaded");
            return;
          }

          let result;
          try {
            result = await db.sequelize.transaction(async (t) => {
              const bulkFile = [],
                renamedFile = [];
              for (const file of req.files) {
                const after = "public/images/gallery/" + file.filename;
                bulkFile.push({
                  path: after,
                  postId: id,
                });
                renamedFile.push({
                  before: file.path,
                  after: after,
                });
              }

              const stored = await db.gallery.bulkCreate(bulkFile, {
                transaction: t,
              });

              storeUpload(renamedFile);

              return stored;
            });
          } catch (e) {
            responseMock.error(res);
            return;
          }

          responseMock.success(res, 200, "File uploaded", result);
        });
      } else {
        responseMock.error(res, 404, "Post not found");
      }
    })
    .catch((e) => {
      responseMock.error(res);
    });
};
