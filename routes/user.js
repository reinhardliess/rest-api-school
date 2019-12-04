'use strict';

const express = require('express');
const router = express.Router();

const db = require('../db');
const { sequelize, Sequelize } = db;
const { User } = db.models;
const { asyncHandler } = require('../lib/utils')

// GET
router.get('/', asyncHandler(async (req, res) => {

}));

module.exports = router;
