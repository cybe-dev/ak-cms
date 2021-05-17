"use strict";
const responseMock = require("../helpers/response-mock");
const { user } = require("../models");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const fail = (res) => {
  responseMock.error(res, 401, "Authentication Failed");
};

module.exports.changePassword = async (req, res) => {
  const { oldPassword, newPassword = "" } = req.body;
  const { id } = req.user;

  try {
    const getUser = await user.findByPk(id);
    if (!getUser) {
      throw new Error("401");
    }

    const check = bcrypt.compareSync(oldPassword, getUser.password);
    if (!check) {
      throw new Error("401");
    }

    const newHash = bcrypt.hashSync(newPassword, 10);
    getUser.password = newHash;
    await getUser.save();
  } catch (e) {
    if (e === "401") {
      responseMock.error(res, 401, "Not authorized");
      return;
    }
    responseMock.error(res);
    return;
  }

  responseMock.success(res, 200, "Password has been changed");
};

module.exports.login = (req, res) => {
  const { email, password } = req.query;

  user
    .findOne({
      where: {
        email,
      },
    })
    .then((result) => {
      if (result) {
        const passwordHash = result.password;
        const match = bcrypt.compareSync(password, passwordHash);
        if (match) {
          const token = jwt.sign(
            {
              id: result.id,
            },
            process.env.JWT_SECRET_KEY,
            {
              expiresIn: "1d",
            }
          );

          responseMock.success(res, 200, "Authentication success", {
            id: result.id,
            fullname: result.fullname,
            email: result.email,
            token,
          });
        } else {
          fail(res);
        }
      } else {
        fail(res);
      }
    })
    .catch((e) => {
      responseMock.error(res);
    });
};
