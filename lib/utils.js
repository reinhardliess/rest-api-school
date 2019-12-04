'use strict';

/**
 * Handler function to wrap each route
 * @param {function} cb - callback
 * @returns {function} function
 */
exports.asyncHandler = cb => {
  return async (req, res, next) => {
    try {
      await cb(req, res, next)
    } catch (error) {
      return next(error)
    }
  }
}

