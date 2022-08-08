const express = require("express");
const {
    createPost, getPosts, commentPost, getPost, deletePost,getPostByTags,likePost,dislikePost,getReactions,updatePost,getPostByUserId,getOtherPostByUserId
} = require("../controllers/Post");
const router = express.Router();

router.route("/").post(createPost).get(getPosts);
router.route("/:id").get(getPost).delete(deletePost);
router.route("/like").patch(likePost);
router.route("/dislike").patch(dislikePost);
router.route("/count/:id").get(getReactions);
router.route("/comment").patch(commentPost);
router.route("/tag/:tag").get(getPostByTags)
router.route("/update").patch(updatePost)
router.route("/userpost/:id").get(getPostByUserId)
router.route("/posts/:id").get(getOtherPostByUserId);

module.exports = router;
