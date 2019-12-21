const Sequelize = require('sequelize');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: process.env.RESTAPI_DB,
});

// Central object with db info
const db = {
  sequelize,
  Sequelize,
  models: {},
  attrib: {
    user: ['id', 'firstName', 'lastName', 'emailAddress'],
    course: ['id', 'title', 'description', 'estimatedTime', 'materialsNeeded'],
  },
};

// import all models
const User = require('./models/user')(sequelize);
const Course = require('./models/course')(sequelize);

// define associations
User.hasMany(Course);
Course.belongsTo(User);

// Exports
db.models.User = User;
db.models.Course = Course;

module.exports = db;
