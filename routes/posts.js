const router = require("express").Router();
const Post = require("../models/Post");
const User = require("../models/User");

//create a post
router.post("/", async (req, res) => {
  const newPost = new Post(req.body);
  try {
    const savedPost = await newPost.save();
    res.status(200).json(savedPost);
  } catch (error) {
    res.status(500).json(error);
  }
});
//update a post
router.put("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post.userId === req.body.userId) {
      await post.updateOne({ $set: req.body });
      res.status(200).json("The post has been updated!!");
    } else {
      res.status(403).json("You can only update posts belonging to you ");
    }
  } catch (error) {
    res.status(500).json(error);
  }
});
//delete a post
router.delete("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post.userId === req.body.userId) {
      await post.deleteOne();
      res.status(200).json("The post has been deleted!!");
    } else {
      res.status(403).json("You can only deleteposts belonging to you ");
    }
  } catch (error) {
    res.status(500).json(error);
  }
});

// like a post
router.put("/:id/like", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    //you can only like a post if it has not been liked previously//
    if (!post.likes.includes(req.body.userId)) {
      //update the post
      await post.updateOne({ $push: { likes: req.body.userId } });
      res.status(200).json("this post has been liked");
    } else {
      //if already liked then dislike
      await post.updateOne({ $pull: { likes: req.body.userId } });
      res.status(403).json("This is post has already been disliked!!");
    }
  } catch (error) {
    res.status(500).json(error);
  }
});
//get a post
router.get("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    res.status(200).json(post);
  } catch (error) {
    res.status(500).json(error);
  }
});
//get all timeline posts
router.get("/timeline/:userId", async (req, res) => {
  let postArray = [];
  try {
    const currentUser = await User.findById(req.params.userId);
    const userPosts = await Post.find({ userId: currentUser._id });
    const friendPosts = await Promise.all(
      currentUser.followings.map((friendId) => {
        return Post.find({ userId: friendId });
      })
    );
    res.status(200).json(userPosts.concat(...friendPosts));
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});
//get users all  posts
router.get("/profile/:userId", async (req, res) => {
  try {
    const posts = await Post.find({ userId: req.params.userId });
    res.status(200).json(posts);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

module.exports = router;
