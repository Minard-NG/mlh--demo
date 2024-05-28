const express = require('express');
const ejs = require('ejs');

const router = express.Router();
const renderFile = ejs.renderFile;

router.get('/', async (req, res) => {
  try {
    const indexContent = await renderFile('views/index.ejs');

    const options = {
      title: 'Welcome to SocialiKool',
      user: req.user,
      success_msg: res.locals.success_msg[0],
      error_msg: res.locals.error_msg[0],
      body: indexContent,
    };

    const layoutContent = await renderFile('views/layout.ejs', options);

    res.send(layoutContent);
  } catch (err) {
    console.error('Error rendering views:', err);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;
