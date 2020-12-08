const Post = require("../../schemas/Post");

module.exports = async (req, res) => {
  try {
    // sorts from most liked to least liked. As default sort is assigned as 1, if use -1 you reverse the order of array
    let posts = await Post.find().sort({ likes: -1 }); // sorts from highest to lowest
    res.json(posts);
  } catch (error) {
    console.error(error);
    return res.status(500).json("Server Error...");
  }
};
