"use strict";
const { Model } = require("sequelize");
const SequelizeSlugify = require("sequelize-slugify");
module.exports = (sequelize, DataTypes) => {
  class blog_category extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.hasMany(models.blog, {
        foreignKey: "categoryId",
        as: "blogs",
      });
    }
  }
  blog_category.init(
    {
      name: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      slug: {
        unique: true,
        type: DataTypes.STRING,
      },
    },
    {
      sequelize,
      modelName: "blog_category",
    }
  );

  SequelizeSlugify.slugifyModel(blog_category, { source: ["name"] });
  return blog_category;
};
