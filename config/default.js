module.exports = {
  app: {
    name: 'Socialikool',
    port: process.env.PORT || 3000,
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'default',
  },
  db: require('./database').development,
};
