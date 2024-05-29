const { Server } = require('socket.io');

let io;
let socketServer;

function initSocketIO(server) {
  io = new Server(server);

  io.on('connection', (socket) => {
    socketServer = socket;
    console.log(`A user connected, socket id: ${socket.id}`);

    socket.on('disconnect', () => {
      console.log(`User disconnected! socket id: ${socket.id}`);
    });
  });
}

function attachSocketIO(req, res, next) {
  req.io = io;
  next();
}

function emitNewPost(post, io) {
  if (io) {
    io.emit('newPost', post);
  } else {
    console.log('io is undefined');
  }
}

function emitPostLiked(postId, likes) {
  if (io) {
    const data = { postId, likes };
    io.emit('postLiked', data);
  } else {
    console.log('io is undefined');
  }
}

function emitNewComment(postId, comment) {
  if (io) {
    const data = { postId, comment };
    io.emit('newComment', data);
  } else {
    console.log('io is undefined');
  }
}

function emitNewReply(commentId, postId, reply) {
  if (io) {
    const data = { commentId, postId, reply };
    io.emit('newReply', data);
  } else {
    console.log('io is undefined');
  }
}

module.exports = { initSocketIO, attachSocketIO, emitNewPost, emitPostLiked, emitNewComment, emitNewReply };
