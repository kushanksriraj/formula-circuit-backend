const mongoose = require("mongoose");
const { catchError } = require("../utils")
const { User } = require("../model/user.model")
const { Post } = require("../model/post.model")

const LIMIT = 3;

const getFeed = async (req, res, next) => {
  catchError(next, async () => {

    const user = await User.findById(req.userId);
    let userIdList = [user._id].concat(user.followingList);
    userIdList = userIdList.map(id => mongoose.Types.ObjectId(id));

    let postList;
    if (req.query.cursor) {
      const bufferObj = Buffer.from(req.query.cursor, "base64");
      const cursor = bufferObj.toString("utf8");

      postList = await Post.find({
        'author': {
          $in: userIdList,
        },
        "createdAt": {
          $lt: cursor
        }
      }).sort({ createdAt: 'desc' }).limit(LIMIT).populate({
        path: "author",
        select: "_id name username profileURL"
      }).exec()
    }
    else {
      postList = await Post.find({
        'author': {
          $in: userIdList
        }
      }).sort({ createdAt: 'desc' }).limit(LIMIT).populate({
        path: "author",
        select: "_id name username profileURL"
      }).exec()
    }
    let next_cursor = postList[postList.length - 1] ? postList[postList.length - 1].createdAt : false;
    let hasMore = false;
    if (next_cursor) {
      const tempPost = await Post.find({
        "createdAt": {
          $lt: next_cursor
        }
      });
      if (tempPost.length) {
        hasMore = true;
      }
    }
    if (next_cursor) {
      const bufferObj = Buffer.from(next_cursor.toString(), "utf8");
      next_cursor = bufferObj.toString("base64");
    }

    res.json({
      success: true,
      postList,
      next_cursor,
      hasMore,
    })
  })
}


module.exports = { getFeed }