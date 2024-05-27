const passport = require('passport');
const User = require('../models/User');

const signup = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const user = new user({ username, email });
    await User.register(user, password);
    res.redirect('/auth/login');
  } catch (err) {
    console.error(err);
    res.redirect('auth/signup');
  }
};

const login = (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/posts',
    failureRedirect: 'auth/login',
  })(req, res, next);
};

const logout = (req, res) => {
  req.logout();
  res.redirect('/');
};

module.exports = {
  signup,
  login,
  logout,
};
