const Sequelize = require('sequelize')

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: process.env.RESTAPI_DB,
})

const db = {
  sequelize,
  Sequelize,
  models: {},
}

// import all models
const User = require('./models/user')(sequelize)
const Course = require('./models/course')(sequelize)

// define associations
User.hasMany(Course);
Course.belongsTo(User);

db.models.User = User;
db.models.Course = Course;

module.exports = db;