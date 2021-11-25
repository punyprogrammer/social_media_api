const router = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");

//REGISTER USERS
router.post("/register", async (req, res) => {
  try {
    //generate password  for the user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);
    //create a new user

    const newUser = new User({
      userName: req.body.userName,
      email: req.body.email,
      password: hashedPassword,
    });
    //save user and response
    const user = await newUser.save();
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json(error);
  }
});
//LOGIN USER
router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      res.status(404).json("User with email id not found!");
    }
    const validPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (!validPassword) {
      res.status(400).json("Invalid Password");
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json(error);
  }
});
module.exports = router;
