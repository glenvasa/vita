const { validationResult } = require("express-validator");
const bcryptjs = require("bcryptjs");
const User = require("../../schemas/User");
const jwt = require("jsonwebtoken");
const config = require("config");

module.exports = async (req, res) => {
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
};
