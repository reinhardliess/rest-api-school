const express = require('express');
const db = require('../db');
const { asyncHandler, authenticateUser } = require('../lib/utils');

const router = express.Router();
const { User } = db.models;

// GET - get authenticated user
router.get(
  '/',
  asyncHandler(authenticateUser),
  asyncHandler(async (req, res) => {
    res.status(200).json(req.currentUser);
  })
);

// POST - add a new user
router.post(
  '/',
  asyncHandler(async (req, res) => {
    // Get the user from the request body.
    await User.create(req.body);
    res
      .status(201)
      .location('/')
      .end();
  })
);

module.exports = router;
