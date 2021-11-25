const router = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");
//update user
router.put("/:id", async (req, res) => {
  if (req.body.userId === req.params.id || req.body.isAdmin) {
    if (req.body.password) {
      try {
        const salt = await bcrypt.genSalt(10);
        req.body.password = await bcrypt.hash(req.body.password, salt);
      } catch (error) {
        return res.status(500).json(error);
      }
    }
    try {
      const user = await User.findByIdAndUpdate(req.params.id, {
        $set: req.body,
      });
      res.status(200).json("Account has been updated!");
    } catch (error) {
      res.status(500).json(error);
    }
  } else {
    return res.status(403).json("You can only update your account!!");
  }
});

//delete user
router.delete("/:id", async (req, res) => {
  if (req.body.userId === req.params.id || req.body.isAdmin) {
    try {
      const user = await User.findByIdAndDelete(req.params.id);
      res.status(200).json("Account has been deleted!");
    } catch (error) {
      res.status(500).json(error);
    }
  } else {
    return res.status(403).json("You can only delete your account!!");
  }
});
//get a user
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    //destructuring to remove unnecessary details
    const { password, updatedAt, ...other } = user._doc;
    res.status(200).json(other);
  } catch (error) {
    res.status(500).json(error);
  }
});
//get all friends
router.get("/friends/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    const friends = await Promise.all(
      user.followings.map((friendId) => {
        return User.findById(friendId);
      })
    );
    let friendlist = [];
    friends.map((friend) => {
      const { _id, userName, profilePicture } = friend;
      friendlist.push({ _id, userName, profilePicture });
    });
    res.status(200).json(friendlist);
  } catch (error) {
    console.log(error)
    res.status(500).json(error);
  }
});
// follow a user
router.put("/:id/follow", async (req, res) => {
  if (req.body.userId !== req.params.id) {
    try {
      const user = await User.findById(req.params.id);
      const currentUser = await User.findById(req.body.userId);
      if (!user.followers.includes(req.body.userId)) {
        await user.updateOne({ $push: { followers: req.body.userId } });
        await currentUser.updateOne({ $push: { followings: req.params.id } });
        res.status(200).json("user has been followed");
      } else {
        res.status(403).json("you allready follow this user");
      }
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    res.status(403).json("you cant follow yourself");
  }
});
//unfollow a user
router.put("/:id/unfollow", async (req, res) => {
  if (req.body.userId !== req.params.id) {
    try {
      //User who is being followed
      const user = await User.findById(req.params.id);
      //User who is following
      const currUser = await User.findById(req.body.userId);
      if (user.followers.includes(req.body.userId)) {
        await user.updateOne({ $pull: { followers: req.body.userId } });
        await currUser.updateOne({ $pull: { followings: req.params.id } });
        res.status(200).json("user has been unfollowed");
      } else {
        res.status(403).json("You dont follow this user!");
      }
    } catch (error) {
      console.log(error);
      res.status(500).json(error);
    }
  } else {
    return res.status(403).json("You cannot unfollow yourself");
  }
});

module.exports = router;
