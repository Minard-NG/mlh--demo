require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const { createServer } = require('node:http');
const { Server } = require('socket.io');
const config = require('./config/default');

const app = express();
const PORT = config.app.port;
const MONGO_URI = config.db.url;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);

//Passport Setup
require('./config/passport')(passport);
app.use(passport.initialize());
app.use(passport.session());

// Connect to MongoDB
mongoose.connect(MONGO_URI);

const server = createServer(app);
const io = new Server(server);

io.on('connection', (socket) => {
  console.log(`A user connected, socket id: ${socket.id}`);

  socket.on('disconnect', () => {
    console.log(`User disconnected! socket id: ${socket.id}`);
  });
});

mongoose.connection.once('open', () => {
  console.log('Connected to MongoDB');

  server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});
