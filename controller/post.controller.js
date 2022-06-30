const mongoose = require("mongoose");
const _ = require("lodash");
const { catchError, getArrayOfUniqueIds } = require("../utils")
const { Post, UserPost } = require("../model/post.model")
const { Notification, UserNotification } = require("../model/notification.model")

const addNewPost = async (req, res, next) => {
  catchError(next, async () => {
    const { post } = req.body;
    let newPost = new Post(post);
    newPost = await newPost.save();
    let user = await UserPost.findById(req.userId);
    if (user) {
      user = _.extend(user, { postList: getArrayOfUniqueIds(user.postList, newPost._id) });
      await user.save();
    }
    else {
      user = new UserPost({ _id: req.userId, postList: [newPost._id] })
      await user.save();
    }
    newPost = await newPost.populate({
      path: "author",
      select: "_id name username profileURL"
    }).execPopulate();

    return res.json({
      success: true,
      newPost
    })
  });
}

const getAllPosts = async (req, res, next) => {
  catchError(next, async () => {
    const id = req.userId;
    const postList = await Post.find({ author: id });
    return res.json({
      success: true,
      postList
    })
  });
}

const updatePost = async (req, res, next) => {
  catchError(next, async () => {
    const { id } = req.params;
    const { content } = req.body;
    let post = await Post.findById(id);
    post = _.extend(post, { content })
    post = await post.save();
    return res.json({
      success: true,
      updatedPost: post
    })
  });
}

const deletePost = async (req, res, next) => {
  catchError(next, async () => {
    const { id } = req.params;
    const post = await Post.findByIdAndDelete(id);
    return res.json({
      success: true,
      deletedPostId: post._id
    })
  });
}

const getPost = async (req, res, next) => {
  catchError(next, async () => {
    const { id } = req.params;
    const post = await Post.findById(id).populate({
      path: "author",
      select: "_id name username profileURL"
    });
    return res.json({
      success: true,
      post
    })
  });
}

const likePost = async (req, res, next) => {
  catchError(next, async () => {
    const { id } = req.params;
    let post = await Post.findById(id);
    post = _.extend(post, { likedBy: getArrayOfUniqueIds(post.likedBy, req.userId) });
    post = await post.save();

    const isAlreadyLiked = await Notification.exists({ action: "LIKED", postId: post._id, actionCreatorId: req.userId });

    if (!isAlreadyLiked) {
      let notification = new Notification({ userId: post.author, action: "LIKED", actionCreatorId: req.userId, postId: post._id, username: "", isRead: false });
      notification = await notification.save();

      let userNotificationList = await UserNotification.findById(post.author);

      if (userNotificationList) {
        userNotificationList = _.extend(userNotificationList, { notificationList: _.concat(userNotificationList.notificationList, notification._id) })
        await userNotificationList.save();
      } else {
        userNotificationList = new UserNotification({ _id: post.author, notificationList: [notification._id] })
        await userNotificationList.save();
      }
    }

    return res.json({
      success: true,
      likedBy: post.likedBy,
      postId: id,
    })
  });
}

const unlikePost = async (req, res, next) => {
  catchError(next, async () => {
    const { id } = req.params;
    let post = await Post.findById(id);
    post = _.extend(post, { likedBy: _.filter(post.likedBy, (id) => id.toString() !== req.userId) })
    post = await post.save();
    return res.json({
      success: true,
      likedBy: post.likedBy,
      postId: id,
    })
  });
}


const reactToPost = async (req, res, next) => {
  catchError(next, async () => {
    const { id } = req.params;
    const type = req.query.type;
    let post = await Post.findById(id);
    const updatedReactions = _.extend(post.reactions, { [type]: getArrayOfUniqueIds(post.reactions[type], req.userId) });
    post = _.extend(post, { reactions: updatedReactions })
    post = await post.save();

    const isAlreadyReacted = await Notification.exists({ action: "REACTED", postId: post._id, actionCreatorId: req.userId });

    if (!isAlreadyReacted) {
      let notification = new Notification({ userId: post.author, action: "REACTED", actionCreatorId: req.userId, postId: post._id, username: "", isRead: false });
      notification = await notification.save();

      let userNotificationList = await UserNotification.findById(post.author);

      if (userNotificationList) {
        userNotificationList = _.extend(userNotificationList, { notificationList: _.concat(userNotificationList.notificationList, notification._id) })
        await userNotificationList.save();
      } else {
        userNotificationList = new UserNotification({ _id: post.author, notificationList: [notification._id] })
        await userNotificationList.save();
      }
    }

    return res.json({
      success: true,
      reactions: post.reactions,
      postId: id,
    })
  });
}

const unReactToPost = async (req, res, next) => {
  catchError(next, async () => {
    const { id } = req.params;
    const type = req.query.type;
    let post = await Post.findById(id);
    const updatedReactions = _.extend(post.reactions, { [type]: _.filter(post.reactions[type], (id) => id.toString() !== req.userId) });
    post = _.extend(post, { reactions: updatedReactions })
    post = await post.save();;
    return res.json({
      success: true,
      reactions: post.reactions,
      postId: id,
    })
  });
}

module.exports = { addNewPost, updatePost, getPost, likePost, reactToPost, unlikePost, unReactToPost, deletePost, getAllPosts }