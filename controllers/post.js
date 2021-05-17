"use strict";
const { postType, gallery } = require("../form-mapping.json");
const upload = require("../middlewares/upload");
const multer = require("multer");
const db = require("../models");
const fs = require("fs");
const responseMock = require("../helpers/response-mock");

module.exports.destroy = (req, res) => {
  const { id } = req.params;

  db.post
    .findByPk(id)
    .then(async (result) => {
      if (result) {
        try {
          await db.sequelize.transaction(async (t) => {
            await result.destroy({ transaction: t });
            if (fs.existsSync(result.thumbnail))
              fs.unlinkSync(result.thumbnail);
            return;
          });
        } catch (e) {
          responseMock.error(res);
          return;
        }
        responseMock.success(res, 200, "Post has been deleted", result);
      } else {
        responseMock.error(res, 404, "Post not found");
      }
    })
    .catch((e) => {
      responseMock.error(res);
    });
};

module.exports.getSlug = (req, res) => {
  const { slug } = req.params;

  db.post
    .findOne({
      where: {
        slug,
      },
      include: [
        {
          model: db.gallery,
          as: "pictures",
          order: [["createdAt", "DESC"]],
          limit: 10,
          offset: 0,
          separated: true,
        },
      ],
    })
    .then((result) => {
      if (result) {
        responseMock.success(res, 200, "Post successfully showed", result);
      } else {
        responseMock.error(res, 404, "Post not found");
      }
    })
    .catch((e) => {
      responseMock.error(res);
    });
};
module.exports.getId = (req, res) => {
  const { id } = req.params;

  db.post
    .findByPk(id)
    .then((result) => {
      if (result) {
        responseMock.success(res, 200, "Post successfully showed", result);
      } else {
        responseMock.error(res, 404, "Post not found");
      }
    })
    .catch((e) => {
      responseMock.error(res);
    });
};

module.exports.update = (req, res) => {
  const { type, id } = req.params;
  const getPostType = postType.find((predicate) => predicate.key === type);
  if (getPostType) {
    let uploader;
    if (getPostType.thumbnail.type === "upload") {
      uploader = upload("thumbnail", "public/images/temp");
    } else {
      uploader = multer().none();
    }

    uploader(req, res, async (err) => {
      const { title, text, thumbnail } = req.body;
      if (err) {
        responseMock.error(res, 400, "Upload error");
        return;
      }

      let result;
      try {
        result = await db.sequelize.transaction(async (t) => {
          const temp = {
            title,
            text,
          };

          let move = false,
            removed;
          if (req.file) {
            const renamed = "public/images/thumbnail/" + req.file.filename;
            temp.thumbnail = renamed;
            move = true;
            removed = req.file.path;
          } else {
            temp.thumbnail = thumbnail;
          }
          const result = await db.post.update(temp, {
            transaction: t,
            where: {
              id,
            },
          });

          if (move) fs.renameSync(req.file.path, temp.thumbnail);
          if (removed && fs.existsSync(removed)) fs.unlinkSync(removed);

          return result;
        });
      } catch (e) {
        console.log(e);
        responseMock.error(res);
        return;
      }

      responseMock.success(res, 200, "Post has been updated", result);
    });
  } else {
    responseMock.error(res, 404, "Type not found");
  }
};

module.exports.count = (req, res) => {
  db.post
    .count({
      group: ["postType"],
    })
    .then((result) => {
      responseMock.success(res, 200, "Post count successfully showed", result);
    })
    .catch((e) => {
      responseMock.error(res);
    });
};

module.exports.index = (req, res) => {
  const { type } = req.params;
  const { offset = 0, limit = 10, nodesc = false } = req.query;

  const attributes = [
    "id",
    "title",
    "thumbnail",
    "slug",
    "createdAt",
    "updatedAt",
  ];
  if (!nodesc) {
    attributes.push("text");
  }

  db.post
    .findAndCountAll({
      where: {
        postType: type,
      },
      attributes,
      order: [["createdAt", "DESC"]],
      offset: parseInt(offset),
      limit: parseInt(limit) > 50 ? 50 : parseInt(limit),
    })
    .then((result) => {
      responseMock.success(res, 200, "Post showed successfully", result);
    })
    .catch((e) => {
      responseMock.error(res);
    });
};

module.exports.post = (req, res) => {
  const { type } = req.params;

  const getPostType = postType.find((predicate) => predicate.key === type);
  if (getPostType) {
    let uploader;
    if (getPostType.thumbnail.type === "upload") {
      uploader = upload("thumbnail", "public/images/temp");
    } else {
      uploader = multer().none();
    }

    uploader(req, res, async (err) => {
      const { title, text, thumbnail } = req.body;
      if (err) {
        responseMock.error(res, 400, "Upload error");
        return;
      }

      let result;
      try {
        result = await db.sequelize.transaction(async (t) => {
          const temp = {
            title,
            text,
            postType: type,
          };

          let move = false;
          if (req.file) {
            const renamed = "public/images/thumbnail/" + req.file.filename;
            temp.thumbnail = renamed;
            move = true;
          } else {
            temp.thumbnail = thumbnail;
          }
          const result = await db.post.create(temp, {
            transaction: t,
          });

          if (move) fs.renameSync(req.file.path, temp.thumbnail);

          return result;
        });
      } catch (e) {
        console.log(e);
        responseMock.error(res);
        return;
      }

      responseMock.success(res, 200, "Post has been added", result);
    });
  } else {
    responseMock.error(res, 404, "Type not found");
  }
};
