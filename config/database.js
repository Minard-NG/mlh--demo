

module.exports = {
  development: {
    url: process.env.MONGO_URI_DEV || 'mongodb://localhost:27017/socialikool-dev',
  },
  test: {
    url: process.env.MONGO_URI_TEST || 'mongodb://localhost:27017/socialikool-test',
  },
  production: {
    url: process.env.MONGO_URI,
  },
};
