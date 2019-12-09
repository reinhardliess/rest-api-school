'use strict';
const auth = require('basic-auth');
const bcrypt = require('bcryptjs');

const db = require('../db');
const { Sequelize, attrib } = db;
const { User, Course } = db.models;

/**
 * Filters Sequelize error properties
 * @param {object} err - Sequelize error object
 * @returns {Array} Array with errors to be returned as json
 */
const validationError = (err, req) => {

  // fields to be returned as json
  const ERR_FIELDS = ['message', 'type', 'path', 'value'];
  let errors;

  // Can only happen when adding/updating a course
  if (err instanceof Sequelize.ForeignKeyConstraintError) {
    errors = {
      message: 'user with "userId" doesn\'t exist as a user',
      type: 'Foreign Key Constraint Error',
      path: 'userId',
      value: req.body.userId
    }
  }

  // handle all other validation errors
  if (err.errors) {
    errors = err.errors.map(error => {
      return Object.keys(error).reduce((newObj, key) => {
        if (ERR_FIELDS.includes(key)) {
          newObj[key] = error[key];
        }
        // filter out password value if necessary
        if (newObj.path === 'password') {
          return filterObject(newObj, 'value');
        } else {
          return newObj;
        }
      }, {});
    })
  }
  return { errors }
}

/**
 * Validates required fields for courses
 * @param {object} req - Express request object
 * @returns {object[]} object array with validation errors if any
 */
const validateCourses = (req) => {
  const required = ['title', 'description', 'userId'];
  const errors = [];
  for (const field of required) {
    if (!req.body[field]) {
      const objErr = {
        message: `Course.${field} cannot be null`,
        type: 'notNull Violation',
        path: `${field}`,
        value: null
      };
      errors.push(objErr);
    }
  }
  return errors;
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
 * Handler function to wrap each route with error handling
 * @param {function} cb - callback
 * @returns {function} function
 */
const asyncHandler = cb => {
  return async (req, res, next) => {
    try {
      await cb(req, res, next);
    } catch (error) {
      // Checks if error was created by Sequelize
      // https://github.com/sequelize/sequelize/blob/3e5b8772ef75169685fc96024366bca9958fee63/lib/errors.js
      if (error instanceof Sequelize.BaseError) {
        res.status(400).json(validationError(error, req));
      } else {
        return next(error);
      }
    }
  }
}

/**
 * Handles courses PUT/DELETE routes
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - next middleware function
 * @param {function} cb - callback cb(course: Course), must return true on success
 */
const courseHandler = async (req, res, next, cb) => {

  try {
    const { id } = req.params;
    const { emailAddress } = req.currentUser;

    const course = await Course.findByPk(id);
    if (course) {
      // only allow authenticated user to update/delete their own course(s)
      const user = await User.findByPk(course.userId);
      if (user.emailAddress === emailAddress) {
        if (await cb(course)) {
          res.status(204).end();
        }
      } else {
        res.status(403).end();
      }
    } else {
      res.status(404).end();
    }

  } catch (error) {
    next(error);
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
  courseHandler,
  validateCourses
}
