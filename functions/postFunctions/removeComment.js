const Post = require("../../schemas/Post");

module.exports = async (req, res) => {
  try {
    let post = await Post.findById(req.params.post_id);

    if (!post) return res.status(404).json("Post not found");

    const removeCommentFromPost = post.comments.filter(
      (comment) => comment.id.toString() !== req.params.comment_id.toString()
    );

    post.comments = removeCommentFromPost;

    await post.save();

    res.json(post);
  } catch (error) {
    console.error(error);
    return res.status(500).json("Server Error...");
  }
};
