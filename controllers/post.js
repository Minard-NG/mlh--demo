const ejs = require('ejs');
const fs = require('fs');
const path = require('path');
const User = require('../models/User');
const Post = require('../models/Post');
const postService = require('../services/post');

const renderFile = ejs.renderFile;

const getPost = async (req, res) => {
  try {
    const posts = await postService.getPosts(req.user._id);
    const users = await User.find({ _id: { $ne: req.user._id } });
    // const users = await User.find({});

    const postContent = await renderFile('views/posts.ejs', { posts, users, user: req.user });

    res.status(200).send(postContent);
  } catch (error) {
    console.log(error);
    res.status(500).send('Internal Server Error!');
  }
};

const createPost = async (req, res) => {
  try {
    const { content, visibility } = req.body;
    const image = req.file ? req.file.path : null;
    let imageMimeType = null;

    let imageData;
    if (image) {
      const imagePath = path.join(__dirname, '..', image);
      imageData = fs.readFileSync(imagePath, { encoding: 'base64' });
      imageMimeType = `image/${path.extname(imagePath).slice(1)}`;
    }

    let visibilityMap;
    if (visibility) {
      if (Array.isArray(visibility)) {
        visibilityMap = new Map(visibility.map((id) => [id, true]));
      } else {
        visibilityMap = new Map([[visibility, true]]);
      }
    } else {
      visibilityMap = new Map();
    }

    // console.log('Content:', content);
    // console.log('Visibility:', visibility);

    const post = await postService.createPost(req.user._id, content, imageData, imageMimeType, visibilityMap, req.io);

    // console.log('post value: ', post);

    res.status(201).json({ success: true, post });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Internal Server Error!' });
  }
};

const likePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user._id;
    const post = await postService.likePost(postId, userId);
    res.status(200).json({ success: true, post });
  } catch (error) {
    res.status(500).json({ error: 'Failed to like post' });
  }
};

module.exports = {
  getPost,
  createPost,
  likePost,
};
