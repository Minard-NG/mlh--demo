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

    console.log('from the socket server', post);
  } else {
    console.log('io is undefined');
  }
}

module.exports = { initSocketIO, attachSocketIO, emitNewPost };
