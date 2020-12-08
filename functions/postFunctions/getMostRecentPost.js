const Post = require("../../schemas/Post");

module.exports = async (req, res) => {
  try {
    let posts = await Post.find().sort({ date: -1 }); // sorts from newest/most recent to oldest, if use 1 it will be oldest to newest
    res.json(posts);
  } catch (error) {
    console.error(error);
    return res.status(500).json("Server Error...");
  }
};
