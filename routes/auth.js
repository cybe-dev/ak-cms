"use strict";

const express = require("express");
const { login, changePassword } = require("../controllers/auth");
const auth = require("../middlewares/auth");
const router = express.Router();

router.put("/change-password", auth, changePassword);
router.get("/login", login);

module.exports = router;
