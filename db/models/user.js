const Sequelize = require('sequelize')
const bcrypt = require('bcryptjs');

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
          msg: 'Please provide a value for firstname'
        }
      }
    },
    lastName: {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Please provide a value for lastname'
        }
      }
    },
    emailAddress: {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
        isEmail: {
          msg: 'Please provide a valid email address'
        }
      },
      set(email) {
        this.setDataValue('emailAddress', email.toLowerCase());
      }
    },
    password: {
      type: Sequelize.STRING,
      allowNull: false,
      set(password) {
        const salt = bcrypt.genSaltSync(10);
        this.setDataValue('password', bcrypt.hashSync(password, salt))
      }
    }

  }, { sequelize })
  return User
}