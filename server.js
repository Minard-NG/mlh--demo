require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const flash = require('connect-flash');
const path = require('path');
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

// Passport Setup
require('./config/passport')(passport);
app.use(passport.initialize());
app.use(passport.session());

// Set EJS as templating engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Flash messages
app.use(flash());

app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.user = req.user || null;
  next();
});

// Setup routes
const homeRoute = require('./routes/index');

app.use(homeRoute);

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
