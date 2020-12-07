const { validationResult } = require("express-validator");
const User = require("../../schemas/User");

module.exports = async (req, res) => {
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
};
