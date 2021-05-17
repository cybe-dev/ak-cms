"use strict";

const express = require("express");
const { addImage } = require("../controllers/image");
const auth = require("../middlewares/auth");
const router = express.Router();

router.post("/", auth, addImage);

module.exports = router;
