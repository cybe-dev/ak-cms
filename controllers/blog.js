"use strict";

const responseMock = require("../helpers/response-mock");
const db = require("../models");

module.exports.getById = (req, res) => {
  const { id } = req.params;

  db.blog
    .findByPk(id)
    .then((result) => {
      if (result) {
        responseMock.success(res, 200, "Blog successfully showed", result);
      } else {
        responseMock.error(res, 404, "Blog not found");
      }
    })
    .catch((e) => {
      responseMock.error(res);
    });
};

module.exports.getBySlug = (req, res) => {
  const { slug } = req.params;

  db.blog
    .findOne({
      where: {
        slug,
      },
    })
    .then((result) => {
      if (result) {
        responseMock.success(res, 200, "Blog successfully showed", result);
      } else {
        responseMock.error(res, 404, "Blog not found");
      }
    })
    .catch((e) => {
      responseMock.error(res);
    });
};

module.exports.category = (req, res) => {
  db.blog_category
    .findAll()
    .then((result) => {
      responseMock.success(
        res,
        200,
        "Category list successfully showed",
        result
      );
    })
    .catch((e) => {
      responseMock.error(res);
    });
};

module.exports.index = async (req, res) => {
  const { offset = 0, limit = 10, category } = req.query;

  if (category) {
    let getCategory;
    try {
      getCategory = await db.blog_category.findByPk(category);
    } catch (e) {
      responseMock.error(res);
      return;
    }

    if (!getCategory) {
      responseMock.error(res, 404, "Category is not found");
      return;
    }
  }
  db.blog
    .findAndCountAll({
      attributes: [
        "id",
        "title",
        "slug",
        "categoryId",
        "createdAt",
        "updatedAt",
      ],
      where: category
        ? {
            categoryId: category,
          }
        : undefined,
      order: [["createdAt", "DESC"]],
      offset: parseInt(offset),
      limit: parseInt(limit) > 50 ? 50 : parseInt(limit),
    })
    .then((result) => {
      responseMock.success(res, 200, "Blog successfully showed", result);
    })
    .catch((e) => {
      responseMock.error(res);
    });
};

module.exports.destroy = async (req, res) => {
  const { id } = req.params;

  let result;
  try {
    result = await db.blog.findByPk(id);
    if (!result) {
      throw new Error("not found");
    }

    await result.destroy();
  } catch (e) {
    if (e === "not found") {
      responseMock.error(res, 404, "Blog not found");
      return;
    }
    responseMock.error(res);
    return;
  }

  responseMock.success(res, 200, "Blog has been deleted", result);
};

module.exports.update = async (req, res) => {
  const { title, body, category } = req.body;
  const { id } = req.params;

  let result;
  try {
    const blog = await db.blog.findByPk(id);
    if (!blog) {
      throw new Error("not found");
    }
    result = await db.sequelize.transaction(async (t) => {
      let getCategory;
      if (category) {
        getCategory = await db.blog_category.findByPk(category);

        if (!getCategory) {
          getCategory = await db.blog_category.create(
            {
              name: category,
            },
            {
              transaction: t,
            }
          );
        }
      }

      const updateBlog = await db.blog.update(
        {
          title,
          body,
          categoryId: getCategory ? getCategory.id : null,
        },
        {
          where: {
            id,
          },
          transaction: t,
        }
      );

      return updateBlog;
    });
  } catch (e) {
    if (e === "not found") {
      responseMock.error(res, 404, "Blog not found");
      return;
    }
    responseMock.error(res);
    return;
  }

  responseMock.success(res, 200, "Blog has been updated", result);
};

module.exports.post = async (req, res) => {
  const { title, body, category } = req.body;

  let result;
  try {
    result = await db.sequelize.transaction(async (t) => {
      let getCategory;
      if (category) {
        getCategory = await db.blog_category.findByPk(category);

        if (!getCategory) {
          getCategory = await db.blog_category.create(
            {
              name: category,
            },
            {
              transaction: t,
            }
          );
        }
      }

      const createBlog = await db.blog.create(
        {
          title,
          body,
          categoryId: getCategory ? getCategory.id : null,
        },
        {
          transaction: t,
        }
      );

      return createBlog;
    });
  } catch (e) {
    responseMock.error(res);
    return;
  }

  responseMock.success(res, 200, "Blog has been created", result);
};
