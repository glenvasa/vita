const { validationResult } = require("express-validator");
const bcryptjs = require("bcryptjs");
const User = require("../../schemas/User");
const jwt = require("jsonwebtoken");
const gravatar = require("gravatar");
const config = require("config");

module.exports = async (req, res) => {
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
};
