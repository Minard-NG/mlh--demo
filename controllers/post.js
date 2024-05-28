const ejs = require('ejs');
const User = require('../models/User');
const postService = require('../services/post');

const renderFile = ejs.renderFile;

const getPost = async (req, res) => {
  try {
    const posts = await postService.getPosts(req.user._id);
    const users = await User.find({});

    const postContent = await renderFile('views/posts.ejs', { posts, users });

    res.status(200).send(postContent);
  } catch (error) {
    console.log(error);
    res.status(500).send('Internal Server Error!');
  }
};

module.exports = {
  getPost,
};
