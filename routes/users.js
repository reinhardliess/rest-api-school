'use strict';

const express = require('express');
const router = express.Router();

const db = require('../db');
const { sequelize, Sequelize } = db;
const { User } = db.models;
const { asyncHandler, authenticateUser } = require('../lib/utils')

// GET - get authenticated user
router.get('/', asyncHandler(authenticateUser), asyncHandler(async (req, res) => {
  res.status(200).json(req.currentUser);
}));

// POST - add a new user
router.post('/', asyncHandler(async (req, res, next) => {

  try {
    // Get the user from the request body.
    await User.create(req.body);
    res.location('/');
    // Set the status to 201 Created and end the response.
    return res.status(201).end();
  } catch (error) {
    // // checking for validation error
    // if (error.name === "SequelizeValidationError") {
    //   // const book = await Book.build(req.body);
    //   // res.render("new-book", { book, errors: error.errors, title: "New Book" })
    //   console.log(error.errors);
    // } else {
    //   next(error);
    // }
    res.status(400).json(error);
  }
}));

module.exports = router;
