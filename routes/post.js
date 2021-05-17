"use strict";

const express = require("express");
const {
  post,
  index,
  getId,
  update,
  getSlug,
  destroy,
  count,
} = require("../controllers/post");
const auth = require("../middlewares/auth");
const router = express.Router();

router.get("/count", count);
router.get("/slug/:slug", getSlug);
router.get("/id/:id", getId);
router.put("/:type/:id", auth, update);
router.get("/:type", index);
router.post("/:type", auth, post);
router.delete("/:id", auth, destroy);

module.exports = router;
