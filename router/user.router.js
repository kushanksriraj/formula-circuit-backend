const express = require("express");
const router = express.Router();
const { authenticateUser } = require("../utils")

const { signUpUserAndSendUserData, loginUserAndSendUserData, getLoggedInUserData, updateUserData, getUserNetwork, addNewFollowing, removeFollowing, getUserData, getSearchedUser } = require('../controller/user.controller');

router.route("/sign-up")
  .post(signUpUserAndSendUserData);

router.route("/login")
  .post(loginUserAndSendUserData);

router.route("/")
  .get(authenticateUser, getLoggedInUserData);

router.route("/:username")
  .get(getUserData);

router.route("/update")
  .post(authenticateUser, updateUserData);

router.route("/network/:username")
  .get(authenticateUser, getUserNetwork);

router.route("/network/follow")
  .post(authenticateUser, addNewFollowing);

router.route("/network/unfollow")
  .post(authenticateUser, removeFollowing);

router.route("/search")
  .post(getSearchedUser)
  // .post(authenticateUser, getSearchedUser)

module.exports = router;