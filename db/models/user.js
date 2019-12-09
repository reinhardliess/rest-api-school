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
        notEmpty: true
      }
    },
    lastName: {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    emailAddress: {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
        isEmail: true,
        notEmpty: true
      },
      set(email) {
        this.setDataValue('emailAddress', email.toLowerCase());
      }
    },
    password: {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
        customValidator(value) {
          const PWD_MIN = 8;
          const password = value.trim();
          if (password.length < PWD_MIN) {
            throw new Error(`User.password must be at least ${PWD_MIN} characters long`);
          }
        }
      }
    }
  }, {
    hooks: {
      // a hook is needed to hash the password,
      // because setters are executed before validation
      beforeCreate(user, options) {
        const salt = bcrypt.genSaltSync(10);
        user.password = bcrypt.hashSync(user.password, salt);
      }
    },
    sequelize
  });
  return User
}