const Post = require('../models/Post');
const Comment = require('../models/Comment');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { emitNewPost, emitPostLiked, emitNewComment } = require('../config/socketController');

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
        path: 'userId',
      },
    })
    .populate({
      path: 'comments',
      populate: {
        path: 'replies',
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
  try {
    let comment = new Comment({ postId, userId, content });
    await comment.save();

    const post = await Post.findById(postId);
    if (!post) {
      throw new Error('Post not found');
    }
    post.comments.push(comment);
    await post.save();

    comment = await Comment.findById(comment._id)
      .populate('userId', 'username email')
      .populate({
        path: 'replies',
        populate: { path: 'userId', select: 'username email' },
      });

    const postAuthor = await User.findById(post.author);
    if (postAuthor && postAuthor._id.toString() !== userId) {
      const notification = new Notification({
        user: postAuthor._id,
        message: `User ${userId} commented on your post.`,
      });
      await notification.save();
    }

    emitNewComment(postId, comment);

    return comment;
  } catch (error) {
    throw new Error('Error adding comment: ' + error.message);
  }
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

  // Emit the update to all clients
  emitPostLiked(postId, post.likes);

  return post;
};

module.exports = {
  createPost,
  getPosts,
  addComment,
  addReply,
  likePost,
};
