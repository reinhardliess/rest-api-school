const Sequelize = require('sequelize')

module.exports = (sequelize) => {
  class User extends Sequelize.Model { }

  User.init({
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    firstName: {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Please provide a value for firstName'
        }
      }
    },
    lastName: {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Please provide a value for lastName'
        }
      }
    },
    emailAddress: {
      type: Sequelize.STRING,
      allowNull: false,

    },
    password: {
      type: Sequelize.STRING,
      allowNull: false
    }

  }, { sequelize })
  return User
}