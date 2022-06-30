const _ = require('lodash');
const jwt = require('jsonwebtoken');
const { User } = require('../model/user.model');
const { Notification, UserNotification } = require("../model/notification.model")
const { catchError } = require('../utils');
const bcrypt = require("bcrypt");
const secret = process.env.secret;

const signUpUserAndSendUserData = async (req, res, next) => {
  catchError(next, async () => {
    let { user } = req.body;
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
    let newUser = new User(user);
    newUser = await newUser.save();
    const token = jwt.sign({ _id: newUser._id }, secret, { expiresIn: "24h" });
    let userData = _.pick(newUser, ["_id", "name", "email", "username", "bio", "profileURL", "followingList", "followersList"])
    userData = _.extend(userData, { token });
    res.json({
      success: true,
      user: userData
    });
  });
}

const loginUserAndSendUserData = async (req, res, next) => {
  catchError(next, async () => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (user) {
      const validPassword = await bcrypt.compare(password, user.password)
      if (validPassword) {
        const token = jwt.sign({ _id: user._id }, secret, { expiresIn: "24h" });
        let userData = _.pick(user, ["_id", "name", "email", "username", "bio", "profileURL", "followingList", "followersList"])
        userData = _.extend(userData, { token });
        return res.json({
          success: true,
          user: userData
        });
      }
      return res.status(401).json({
        success: false,
        message: "Authentication error!"
      });
    }
    return res.json({
      success: false,
      message: "User not found!"
    });
  });
}

const getLoggedInUserData = async (req, res, next) => {
  catchError(next, async () => {
    const user = await User.findById(req.userId);
    if (user) {
      return res.json({
        success: true,
        user: _.pick(user, ["_id", "name", "email", "username", "bio", "profileURL", "followingList", "followersList"])
      });
    }
    return res.json({
      success: false,
      message: "User not found!"
    });
  });
}

const getUserData = async (req, res, next) => {
  catchError(next, async () => {
    const { username } = req.params;
    const user = await User.find({ username });
    if (user) {
      return res.json({
        success: true,
        user: _.pick(user[0], ["_id", "name", "email", "username", "bio", "profileURL", "followingList", "followersList"])
      });
    }
    return res.json({
      success: false,
      message: "User not found!"
    });
  });
}

const updateUserData = async (req, res, next) => {
  catchError(next, async () => {
    const { bio, profileURL } = req.body;
    let user = await User.findById(req.userId);
    if (user) {
      user = _.extend(user, { bio });
      user = _.extend(user, { profileURL });
      user = await user.save();
      return res.json({
        success: true,
        user: _.pick(user, ["_id", "bio", "profileURL"])
      });
    }
    return res.json({
      success: false,
      message: "User not found!"
    });
  });
}

const getUserNetwork = async (req, res, next) => {
  catchError(next, async () => {
    const { username } = req.params;
    let user = await User.find({ username }).populate({
      path: "followingList",
      select: "_id name email username bio profileURL"
    }).populate({
      path: "followersList",
      select: "_id name email username bio profileURL"
    });
    if (user) {
      return res.json({
        success: true,
        user: _.pick(user[0], ["followingList", "followersList", "name", "_id", "username", "profileURL"])
      });
    }
    return res.json({
      success: false,
      message: "User not found!"
    });
  });
}

const addNewFollowing = async (req, res, next) => {
  catchError(next, async () => {
    const { userId } = req.body;
    let followingUser = await User.findById(req.userId);
    if (followingUser) {
      followingUser = _.extend(followingUser, { followingList: _.union(followingUser.followingList, [userId]) });
      await followingUser.save();

      let followedUser = await User.findById(userId);
      followedUser = _.extend(followedUser, { followersList: _.union(followedUser.followersList, [req.userId]) });
      await followedUser.save();

      const isAlreadyFollowed = await Notification.exists({ action: "FOLLOWED", actionCreatorId: req.userId });

      if (!isAlreadyFollowed) {
        let notification = new Notification({ userId: followedUser._id, action: "FOLLOWED", actionCreatorId: req.userId, username: "", isRead: false });

        notification = await notification.save();

        let userNotificationList = await UserNotification.findById(followedUser._id);

        if (userNotificationList) {
          userNotificationList = _.extend(userNotificationList, { notificationList: _.concat(userNotificationList.notificationList, notification._id) })
          await userNotificationList.save();
        } else {
          userNotificationList = new UserNotification({ _id: followedUser._id, notificationList: [notification._id] })
          await userNotificationList.save();
        }
      }

      return res.json({
        success: true,
        followedUserId: followedUser._id,
      });
    }
    return res.json({
      success: false,
      message: "User not found!"
    });
  });
}

const removeFollowing = async (req, res, next) => {
  catchError(next, async () => {
    const { userId } = req.body;
    let unFollowingUser = await User.findById(req.userId);
    if (unFollowingUser) {
      unFollowingUser = _.extend(unFollowingUser, { followingList: _.filter(unFollowingUser.followingList, (id) => id.toString() !== userId) });
      await unFollowingUser.save();

      let unFollowedUser = await User.findById(userId);
      unFollowedUser = _.extend(unFollowedUser, { followersList: _.filter(unFollowedUser.followersList, (id) => id.toString() !== req.userId) });
      await unFollowedUser.save();
      return res.json({
        success: true,
        unFollowedUserId: unFollowedUser._id
      });
    }
    return res.json({
      success: false,
      message: "User not found!"
    });
  });
}

const getSearchedUser = async (req, res, next) => {
  catchError(next, async () => {
    const { name } = req.body;

    const userList = await User.find({ name }, "_id name username profileURL");
    
    return res.json({
      success: false,
      userList
    });
  });
}

module.exports = { signUpUserAndSendUserData, loginUserAndSendUserData, getLoggedInUserData, updateUserData, addNewFollowing, removeFollowing, getUserData, getUserNetwork, getSearchedUser }