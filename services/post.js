const Post = require('../models/Post');
const Comment = require('../models/Comment');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { emitNewPost } = require('../config/socketController');

const createPost = async (userId, content, image, imageMimeType, visibility, io) => {
  let post = new Post({ author: userId, content, image, imageMimeType, visibility });
  await post.save();

  post = await Post.findById(post._id)
    .populate('author')
    .populate({
      path: 'comments',
      populate: {
        path: 'userId replies',
        populate: { path: 'userId' },
      },
    })
    .exec();

  emitNewPost(post, io);

  return post;
};

const getPosts = async (userId) => {
  // const user = await User.findById(userId);
  const posts = await Post.find()
    .populate('author')
    .populate({
      path: 'comments',
      populate: {
        path: 'userId replies',
        populate: { path: 'userId' },
      },
    })
    .exec();

  return posts.filter((post) => {
    //Check the post visibility settings
    return !post.visibility || !post.visibility.get(userId.toString());
  });
};

const addComment = async (postId, userId, content) => {
  const comment = new Comment({ postId, userId, content });
  await comment.save();

  const post = await Post.findById(postId);
  post.comments.push(comment);
  await post.save();

  const postAuthor = await User.findById(post.author);
  if (postAuthor._id.toString() != userId) {
    const notification = new Notification({
      user: postAuthor._id,
      message: `User ${userId} commented on your post.`,
    });
    await notification.save();
  }

  return comment;
};

const addReply = async (commentId, userId, content) => {
  const reply = new Comment({ userId, content });
  await reply.save();

  const comment = await Comment.findById(commentId);
  comment.replies.push(reply);
  await comment.save();

  return reply;
};

const likePost = async (postId, userId) => {
  const post = await Post.findById(postId);
  post.likes += 1;
  await post.save();

  const postAuthor = await User.findById(post.author);
  if (postAuthor._id.toString() !== userId) {
    const notification = new Notification({
      user: postAuthor._id,
      message: `User ${userId} liked your post.`,
    });

    await notification.save();
  }

  return post;
};

module.exports = {
  createPost,
  getPosts,
  addComment,
  addReply,
  likePost,
};
