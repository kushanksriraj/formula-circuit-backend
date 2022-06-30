const express = require("express");
const router = express.Router();
const { authenticateUser, catchError } = require("../utils")
const { Post } = require("../model/post.model")
const { User } = require("../model/user.model")

router.route("/")
  .get(authenticateUser, async (req, res, next) => {
    catchError(next, async () => {
      const search = req.query.text;
      if (search) {
        let userList, postList;
        if (search === "DEFAULT") {
             userList = await User.find({}).sort({ createdAt: 'desc' }).select("_id name profileURL username").limit(5)
        }
        else if (search[0] === '@') {
          userList = await User.find({ $text: { $search: search.substring(1) } },
            {
              score: { $meta: "textScore" }
            }).sort({ score: { $meta: "textScore" } }).select("_id name profileURL username")
        } else {
          postList = await Post.find({ $text: { $search: search } },
            {
              score: { $meta: "textScore" }
            }).sort({ score: { $meta: "textScore" } }).populate({
              path: "author",
              select: "_id name username profileURL"
            })
        }
        res.json({
          success: true,
          userList: userList || [],
          postList: postList || []
        })
      }
    })
  })

module.exports = router;