"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class basic_information extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  basic_information.init(
    {
      key: {
        allowNull: false,
        type: DataTypes.STRING,
        unique: true,
      },
      value: {
        allowNull: false,
        type: DataTypes.TEXT,
      },
    },
    {
      sequelize,
      modelName: "basic_information",
    }
  );
  return basic_information;
};
