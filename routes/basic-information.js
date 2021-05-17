"use strict";

const express = require("express");
const { update, index } = require("../controllers/basic-information");
const auth = require("../middlewares/auth");
const router = express.Router();

router.get("/", index);
router.put("/", auth, update);

module.exports = router;
