require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const flash = require('connect-flash');
const path = require('path');
const { createServer } = require('node:http');
const { initSocketIO, attachSocketIO } = require('./config/socketController');
const config = require('./config/default');

const app = express();
const PORT = config.app.port;
const MONGO_URI = config.db.url;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
  })
);

// Flash messages
app.use(flash());

// Passport Setup
require('./config/passport')(passport);
app.use(passport.initialize());
app.use(passport.session());

// Set EJS as templating engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.user = req.user || null;
  next();
});

// Connect to MongoDB
mongoose.connect(MONGO_URI);

const server = createServer(app);
initSocketIO(server);
app.use(attachSocketIO);

// Setup routes
const homeRoute = require('./routes/index');
const authRoute = require('./routes/auth');
const postRoute = require('./routes/post');

app.use(homeRoute);
app.use('/auth', authRoute);
app.use('/posts', postRoute);
app.post('/test', (req, res) => {
  console.log('Test request body:', req.body);
  res.status(200).json({ success: true, data: req.body });
});

// default error handling middleware
app.use((error, req, res, next) => {
  console.log(error);
  res.status(500).send('Internal Server Error');
});

mongoose.connection.once('open', () => {
  console.log('Connected to MongoDB');

  server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});
