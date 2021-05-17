"use strict";

const express = require("express");
const {
  post,
  indexByPost,
  destroy,
  indexByType,
} = require("../controllers/gallery");
const auth = require("../middlewares/auth");
const router = express.Router();

router.get("/type/:type", indexByType);
router.get("/post/:id", indexByPost);
router.post("/:id", auth, post);
router.delete("/:id", auth, destroy);

module.exports = router;
