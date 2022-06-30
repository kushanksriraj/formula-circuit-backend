const express = require("express");
const router = express.Router();
const { authenticateUser } = require("../utils")
const { addNewPost, updatePost, getPost, likePost, reactToPost, unlikePost, unReactToPost, deletePost, getAllPosts } = require("../controller/post.controller")

router.route("/")
  .post(authenticateUser, addNewPost)

router.route("/all")
  .get(authenticateUser, getAllPosts)

router.route("/:id")
  .post(authenticateUser, updatePost)
  .delete(authenticateUser, deletePost)
  .get(getPost)

router.route("/:id/like")
  .post(authenticateUser, likePost)

router.route("/:id/unlike")
  .post(authenticateUser, unlikePost)

router.route("/:id/react")
  .post(authenticateUser, reactToPost)

router.route("/:id/unreact")
  .post(authenticateUser, unReactToPost)

module.exports = router;