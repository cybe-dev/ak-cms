"use strict";
const { Model } = require("sequelize");
const SequelizeSlugify = require("sequelize-slugify");
module.exports = (sequelize, DataTypes) => {
  class blog extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.blog_category, {
        foreignKey: "categoryId",
        as: "category",
      });
    }
  }
  blog.init(
    {
      thumbnail: {
        type: DataTypes.STRING,
      },
      title: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      body: {
        allowNull: false,
        type: DataTypes.TEXT,
        set(value) {
          const regex = /<img\b[^>]+?src\s*=\s*['"]?([^\s'"?#>]+)/;
          const match = regex.exec(value);
          if (match) {
            this.setDataValue("thumbnail", match[1]);
          } else {
            this.setDataValue("thumbnail", null);
          }
          this.setDataValue("body", value);
        },
      },
      categoryId: {
        allowNull: true,
        type: DataTypes.INTEGER,
      },
      slug: {
        unique: true,
        type: DataTypes.STRING,
      },
    },
    {
      sequelize,
      modelName: "blog",
    }
  );

  SequelizeSlugify.slugifyModel(blog, { source: ["title"] });

  return blog;
};
