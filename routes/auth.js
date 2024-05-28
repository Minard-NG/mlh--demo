const express = require('express');
const router = express.Router();
const { getLogin, getSignup, signup, login, logout } = require('../services/auth');

router.get('/signup', getSignup);
router.post('/signup', signup);
router.get('/login', getLogin);
router.post('/login', login);
router.get('/logout', logout);

module.exports = router;
