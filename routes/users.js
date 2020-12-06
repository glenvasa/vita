const express = require("express");
const router = express.Router(); // allows us to use different files for routes besides server.js
const { check, validationResult } = require("express-validator");
let User = require("../schemas/User");
const bcryptjs = require("bcryptjs");
const gravatar = require("gravatar");
const config = require("config");
const jwt = require("jsonwebtoken");

router.post(
  "/register",
  [
    check("name", "Name is empty").not().isEmpty(),
    check("lastName", "Last name is empty").not().isEmpty(),
    check("userName", "Username is empty").not().isEmpty(),
    check("email", "Email is not a valid email address").isEmail(),
    check(
      "password",
      "Password needs to contain between 6 and 12 alphanumeric characters"
    ).isLength({ min: 6, max: 12 }),
  ],
  async (req, res) => {
    try {
      let { name, lastName, userName, email, password } = req.body;
      let user = await User.findOne({ email }).select("-password"); //we don't need to check for the pasword
      let fetchedUserNameFromDatabase = await User.findOne({ userName }).select(
        "-password"
      );
      let errors = validationResult(req);

      if (!errors.isEmpty())
        return res.status(400).json({ errors: errors.array() });

      if (user) return res.status(401).send("Email address is already in use.");

      if (fetchedUserNameFromDatabase)
        return res.status(401).send("Username is not available.");

      const avatar = gravatar.url(email, {
        r: "pg",
        d: "mn",
        s: "200",
      });

      let newUser = new User({
        name,
        lastName,
        userName,
        email,
        password,
        avatar,
      });
      const salt = await bcryptjs.genSalt(10);

      let hashedPassword = await bcryptjs.hash(password, salt);

      newUser.password = hashedPassword;

      await newUser.save();

      const payload = {
        user: {
          id: newUser._id,
        },
      };

      jwt.sign(
        payload,
        config.get("jsonWebTokenSecret"),
        { expiresIn: 3600 },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } catch (error) {
      console.log(error.message);
      return res.status(500).send("Server error");
    }
  }
);

router.post(
  "/login",
  [
    check("email", "Email is not a valid email address").isEmail(),
    check(
      "password",
      "Password needs to contain between 6 and 12 alphanumeric characters"
    ).isLength({ min: 6, max: 12 }),
  ],
  async (req, res) => {
    try {
      let { email, password } = req.body;
      let user = await User.findOne({ email });

      let errors = validationResult(req);

      if (!errors.isEmpty())
        return res.status(400).json({ errors: errors.array() });

      if (!user)
        return res
          .status(404)
          .send("User with this email has not been registered yet.");

      let doPasswordsMatch = await bcryptjs.compare(password, user.password);

      if (!doPasswordsMatch)
        return res.status(401).json("Password does not match");

      const payload = {
        user: {
          id: user._id,
        },
      };

      jwt.sign(
        payload,
        config.get("jsonWebTokenSecret"),
        { expiresIn: 3600 },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } catch (error) {
      console.log(error.message);
      return res.status(500).send("Server error");
    }
  }
);

module.exports = router;
