const express = require("express");
const router = express.Router(); // allows us to use different files for routes besides server.js
const { check, validationResult } = require("express-validator");
let User = require("../schemas/User");
const bcryptjs = require("bcryptjs");
const gravatar = require("gravatar");
const config = require("config");
const jwt = require("jsonwebtoken");
const authentication = require("../middleware/authentication");

router.get("/", authentication, async (req, res) => {
  try {
    let user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (error) {
    console.error(error.message);
    return res.status(500).send("Server error");
  }
});

router.get("/get_user_by_email/:user_email", async (req, res) => {
  try {
    let userEmail = req.params.user_email;
    let user = await User.findOne({ email: userEmail }).select("-password");
    res.json(user);
  } catch (error) {
    console.error(error.message);
    return res.status(500).send("Server error");
  }
});

router.get("/users", async (req, res) => {
  try {
    let users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    console.error(error.message);
    return res.status(500).send("Server error");
  }
});

router.get("/get_user_by_id/:user_id", async (req, res) => {
  try {
    let userId = req.params.user_id;
    let user = await User.findById(userId).select("-password");
    res.json(user);
  } catch (error) {
    console.error(error.message);
    return res.status(500).send("Server error");
  }
});

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
      console.error(error.message);
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
      console.error(error.message);
      return res.status(500).send("Server error");
    }
  }
);

router.put(
  "/search_by_username",
  [check("userNameFromSearch", "Search is empty").not().isEmpty()],
  async (req, res) => {
    try {
      let { userNameFromSearch } = req.body;
      let errors = validationResult(req);

      if (!errors.isEmpty())
        return res.status(400).json({ errors: errors.array() });

      let users = await User.find().select("-password");
      let findUserByUsername = users.filter(
        (user) =>
          user.userName.toString().toLowerCase().split(" ").join("") ===
          userNameFromSearch.toString().toLowerCase().split(" ").join("")
      );
      // if username is: apples and Bananas, -> string "apples and Bananas" -> "apples and bananas" -> ["apples", "and", "bananas"] -> "applesandbananas"
      res.json(findUserByUsername);
    } catch (error) {
      console.error(error.message);
      return res.status(500).send("Server error");
    }
  }
);

router.put(
  "/change_user_data/:user_data_to_change",
  authentication,
  [check("changeUserData", "Input is empty").not().isEmpty()],
  async (req, res) => {
    try {
      const { changeUserData } = req.body;
      let errors = validationResult(req);

      if (!errors.isEmpty())
        return res.status(400).json({ errors: errors.array() });

      let user = await User.findById(req.user.id).select("-password");

      if (!user) return res.status(404).json("User not found");

      //userDataToChage -< name, lastName, userName

      let userDataToChange = req.params.user_data_to_change.toString();

      if (user[userDataToChange] === changeUserData.toString())
        return res
          .status(401)
          .json("This is the same data that is already in the database");

      user[userDataToChange] = changeUserData.toString();

      await user.save();

      res.json("Data is changed");
    } catch (error) {
      console.error(error.message);
      return res.status(500).send("Server error");
    }
  }
);

router.put(
  "/check_actual_password",
  authentication,
  [
    check(
      "passwordToCheck",
      "Password should be between 6 and 12 characters"
    ).isLength({ min: 6, max: 12 }),
  ],
  async (req, res) => {
    try {
      const { passwordToCheck } = req.body;
      let errors = validationResult(req);
      if (!errors.isEmpty())
        return res.status(400).json({ errors: errors.array() });
      let user = await User.findById(req.user.id);

      let doPasswordsMatch = await bcryptjs.compare(
        passwordToCheck,
        user.password
      );

      if (!doPasswordsMatch)
        return res.status(401).json("Passwords do not match");

      res.json("success");
    } catch (error) {
      console.error(error.message);
      return res.status(500).send("Server error");
    }
  }
);

router.put(
  "/change_user_password",
  authentication,
  [
    check(
      "newPassword",
      "New password should be between 6 and 12 characters"
    ).isLength({ min: 6, max: 12 }),
  ],
  async (req, res) => {
    try {
      const { newPassword } = req.body;
      let errors = validationResult(req);
      if (!errors.isEmpty())
        return res.status(400).json({ errors: errors.array() });
      let user = await User.findById(req.user.id);

      const salt = await bcryptjs.genSalt(10);
      const hashedPassword = await bcryptjs.hash(newPassword, salt);

      user.password = hashedPassword;

      await user.save();

      res.json("Successfully changed password");
    } catch (error) {
      console.error(error.message);
      return res.status(500).send("Server error");
    }
  }
);

module.exports = router;
