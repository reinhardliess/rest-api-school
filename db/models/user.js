const Sequelize = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize) => {
  class User extends Sequelize.Model {}

  User.init(
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      firstName: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          notEmpty: { msg: 'Please enter your first name' },
        },
      },
      lastName: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'Please enter your last name',
          },
        },
      },
      emailAddress: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          isEmail: {
            msg: 'Please provide a valid email address',
          },
        },
        set(email) {
          this.setDataValue('emailAddress', email.toLowerCase());
        },
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          customValidator(value) {
            const PWD_MIN = 8;
            const password = value.trim();
            if (password.length < PWD_MIN) {
              throw new Error(
                `Password must be at least ${PWD_MIN} characters long`
              );
            }
          },
        },
      },
    },
    {
      hooks: {
        // a hook is needed to hash the password,
        // because setters are executed before validation (which makes sense)
        beforeCreate(user) {
          const salt = bcrypt.genSaltSync(10);
          // eslint-disable-next-line no-param-reassign
          user.password = bcrypt.hashSync(user.password, salt);
        },
      },
      sequelize,
    }
  );
  return User;
};
