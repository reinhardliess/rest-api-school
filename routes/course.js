'use strict';

const express = require('express');
const router = express.Router();

const db = require('../db');
const { attrib, sequelize, Sequelize } = db;
const { Course, User } = db.models;
const { asyncHandler } = require('../lib/utils')

const options = {
  attributes: attrib.course,
  include: [{
    attributes: attrib.user,
    model: User,
    where: { id: Sequelize.col('Course.userId') }
  }]
};

// GET all courses with user owning the course
router.get('/', asyncHandler(async (req, res) => {
  const courses = await Course.findAll(options);
  res.status(200).json({ Courses: courses });
}));

// GET course with id with user owning the course
router.get('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const course = await Course.findByPk(id, options);
  if (course) {
    res.status(200).json({ course });
  }
}));


module.exports = router;
