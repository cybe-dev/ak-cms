"use strict";
const { Model } = require("sequelize");
const SequelizeSlugify = require("sequelize-slugify");
module.exports = (sequelize, DataTypes) => {
  class post extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.hasMany(models.gallery, { foreignKey: "postId", as: "pictures" });
    }
  }
  post.init(
    {
      postType: DataTypes.STRING,
      title: DataTypes.STRING,
      thumbnail: DataTypes.STRING,
      text: DataTypes.TEXT,
      slug: {
        allowNull: true,
        type: DataTypes.STRING,
        unique: true,
      },
    },
    {
      sequelize,
      modelName: "post",
    }
  );

  SequelizeSlugify.slugifyModel(post, { source: ["title"] });

  return post;
};
