const express = require('express');
const router = express.Router();
const ejs = require('ejs');
const renderFile = ejs.renderFile;

router.get('/', async (req, res) => {
  try {
    const indexContent = await renderFile('views/index.ejs', {
      title: 'Welcome to SocialiKool',
      user: req.user,
      success_msg: req.flash('success_msg'),
      error_msg: req.flash('error_msg'),
    });

    const layoutContent = await renderFile('views/layout.ejs', {
      title: 'Welcome to SocialiKool',
      user: req.user,
      success_msg: req.flash('success_msg'),
      error_msg: req.flash('error_msg'),
      body: indexContent,
    });

    res.send(layoutContent);
  } catch (err) {
    console.error('Error rendering views:', err);
    res.status(500).send('Internal Server Error');
  }
});

// router.get('/', (req, res) => {
//   res.render('index', {
//     layout: 'layout',
//     title: 'Welcome to SocialiKool',
//     user: req.user,
//     success_msg: req.flash('success_msg'),
//     error_msg: req.flash('error_msg'),
//   });
// });

module.exports = router;
