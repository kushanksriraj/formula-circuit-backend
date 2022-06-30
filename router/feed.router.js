const express = require("express");
const router = express.Router();
const { authenticateUser } = require("../utils")

const { getFeed } = require("../controller/feed.controller")

router.route("/")
  .get(authenticateUser, getFeed)

module.exports = router;