'use strict';
const auth = require('basic-auth');
const bcrypt = require('bcryptjs');

const db = require('../db');
const { attrib } = db;
const { User } = db.models;


/**
 * Filters out properties in an object
 * @param {object} obj - object to filter
 * @param  {...string} props - properties to exclude
 * @returns {object} obj - filtered object
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
      return next(error)
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
    // Look for a user whose `username` matches the credentials `name` property.
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
    res.status(401).json({ message: 'Access Denied' });
  } else {
    next();
  }
};

module.exports = {
  authenticateUser,
  filterObject,
  asyncHandler
}