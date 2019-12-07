'use strict';

const express = require('express');
const router = express.Router();

const db = require('../db');
const { sequelize, Sequelize } = db;
const { User } = db.models;
const { asyncHandler, authenticateUser,
  validationError, isSeqError } = require('../lib/utils');

// GET - get authenticated user
router.get('/', asyncHandler(authenticateUser), asyncHandler(async (req, res) => {
  res.status(200).json(req.currentUser);
}));

// POST - add a new user
router.post('/', asyncHandler(async (req, res, next) => {

  // Get the user from the request body.
  await User.create(req.body);
  res.location('/');
  // Set the status to 201 Created and end the response.
  return res.status(201).end();

}));

module.exports = router;
