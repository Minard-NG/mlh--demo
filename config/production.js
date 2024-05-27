const defaultConfig = require('./default');

module.exports = {
  ...defaultConfig,
  db: require('./database').production,
};
