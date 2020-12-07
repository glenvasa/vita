const { validationResult } = require("express-validator");
const bcryptjs = require("bcryptjs");
const User = require("../../schemas/User");

module.exports = async (req, res) => {
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
};
