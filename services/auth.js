const passport = require('passport');
const ejs = require('ejs');
const User = require('../models/User');

const renderFile = ejs.renderFile;

const getSignup = async (req, res) => {
  try {
    const signupContent = await renderFile('views/signup.ejs');

    const layoutContent = await renderFile('views/layout.ejs', {
      title: 'Sign Up',
      user: req.user,
      success_msg: res.locals.success_msg[0],
      error_msg: res.locals.error_msg[0],
      body: signupContent,
    });

    res.send(layoutContent);
  } catch (err) {
    console.log('Error rendering view', err);
    res.status(500).send('Internal Server Error');
  }
};

const signup = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      req.flash('error_msg', 'Email already registered');
      return res.redirect('/auth/signup');
    }

    // Create a new user instance
    const user = new User({ username, email, password });

    await user.save();

    req.flash('success_msg', 'You have successfully signed up');
    return res.redirect('/auth/login?success=true');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'An error occurred during sign up');
    return res.redirect('/auth/signup?error=true'); // Pass a query parameter to indicate error
  }
};

const getLogin = async (req, res) => {
  try {
    const loginContent = await renderFile('views/login.ejs');

    const layoutContent = await renderFile('views/layout.ejs', {
      title: 'Login',
      user: req.user,
      success_msg: res.locals.success_msg[0],
      error_msg: res.locals.error_msg[0],
      body: loginContent,
    });

    res.send(layoutContent);
  } catch (err) {
    console.log('Error in rendering:', err);
    req.flash('error_msg', 'An error occurred during login');
    res.status(500).send('Internal Server Error');
  }
};

const login = (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/posts',
    failureRedirect: '/auth/login',
    failureFlash: true, // Enable flash messages for failed authentication
    failureFlash: {
      type: 'error_msg', // Specify the type of flash message
      message: 'Invalid username or password.', // Customize the error message
    },
  })(req, res, next);
};

const logout = (req, res) => {
  req.logout((err) => {
    if (err) {
      console.log(err);
      return next(err);
    }
  });
  res.redirect('/');
};

module.exports = {
  getSignup,
  signup,
  getLogin,
  login,
  logout,
};
