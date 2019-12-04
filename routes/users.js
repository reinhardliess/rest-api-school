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
router.post('/', asyncHandler(async (req, res) => {

}));

module.exports = router;
