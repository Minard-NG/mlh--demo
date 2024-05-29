const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const { isAuthenticated } = require('../middlewares/auth');
const postController = require('../controllers/post');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

router.get('/', isAuthenticated, postController.getPost);
router.post('/create', isAuthenticated, upload.single('image'), postController.createPost);
router.post('/:postId/like', isAuthenticated, postController.likePost)
router.post('/:postId/comment', isAuthenticated, postController.addComment)

module.exports = router;
