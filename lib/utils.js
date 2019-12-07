'use strict';
const auth = require('basic-auth');
const bcrypt = require('bcryptjs');

const db = require('../db');
const { Sequelize, attrib } = db;
const { User } = db.models;

/**
 * Checks if error was created by Sequelize
 * https://github.com/sequelize/sequelize/blob/3e5b8772ef75169685fc96024366bca9958fee63/lib/errors.js
 * @param {object} error - Error object
 * @returns {boolean} true if Sequelize error
 */
// REFACTOR: check relevance
const isSeqError = error => error instanceof Sequelize.BaseError;

/**
 * Filters Sequelize error properties
 * @param {object} err - Sequelize error object
 * @returns {Array} Array with errors to be returned as json
 */
const validationError = (err) => {

  // fields to be returned
  const ERR_FIELDS = ['message', 'type', 'path', 'value'];
  let errors;

  // Can only happen when adding/updating a course
  if (err instanceof Sequelize.ForeignKeyConstraintError) {
    errors = {
      message: 'user with "userId" doesn\'t exist as a user',
      type: 'Foreign Key Constraint Error',
      path: 'userId'
    }
  }

  // handle all other validation errors
  if (err.errors) {
    errors = err.errors.map(error => {
      return Object.keys(error).reduce((newObj, key) => {
        if (ERR_FIELDS.includes(key)) {
          newObj[key] = error[key];
        }
        return newObj;
      }, {});
    })
  }
  return { errors }
}

/**
 * Filters out properties in an object
 * @param {object} obj - object to filter
 * @param  {...string} props - properties to exclude
 * @returns {object} filtered object
 */
const filterObject = (obj, ...props) => {
  return (Object.keys(obj).reduce((newObj, key) => {
    if (!props.includes(key)) {
      newObj[key] = obj[key]
    }
    return newObj
  }, {}));
}


/**
 * Handler function to wrap each route
 * @param {function} cb - callback
 * @returns {function} function
 */
const asyncHandler = cb => {
  return async (req, res, next) => {
    try {
      await cb(req, res, next)
    } catch (error) {
      if (error instanceof Sequelize.BaseError) {
        res.status(400).json(validationError(error));
      } else {
        return next(error);
      }
    }
  }
}

/**
 * Middleware function to authenticate user via basic auth
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - next middleware function
 */
const authenticateUser = async (req, res, next) => {
  let message = null;

  // Get the user's credentials from the Authorization header.
  const credentials = auth(req);

  if (credentials) {
    // Look for a user whose email matches the credentials `name` property.
    credentials.name = credentials.name.toLowerCase();
    const user = await User.findOne({
      attributes: [...attrib.user, 'password'],
      where: { emailAddress: credentials.name }
    });

    if (user) {
      const authenticated = bcrypt.compareSync(credentials.pass, user.password);
      if (authenticated) {
        console.log(`Authentication successful for username: ${user.emailAddress}`);

        // Store the user on the Request object.
        req.currentUser = filterObject(user.get({ plain: 'true' }), 'password');
      } else {
        message = `Authentication failure for username: ${user.emailAddress}`;
      }
    } else {
      message = `User not found for email address: ${credentials.name}`;
    }
  } else {
    message = 'Auth header not found';
  }

  if (message) {
    console.warn(message);
    res.status(401).end();
  } else {
    next();
  }
};

module.exports = {
  authenticateUser,
  filterObject,
  asyncHandler,
  validationError,
  isSeqError
}
