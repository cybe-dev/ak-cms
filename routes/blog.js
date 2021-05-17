"use strict";

const express = require("express");
const {
  post,
  category,
  index,
  getById,
  update,
  destroy,
  getBySlug,
} = require("../controllers/blog");
const auth = require("../middlewares/auth");
const router = express.Router();

router.get("/category", category);
router.get("/slug/:slug", getBySlug);
router.get("/:id", getById);
router.delete("/:id", auth, destroy);
router.put("/:id", auth, update);
router.get("/", index);
router.post("/", auth, post);

module.exports = router;
