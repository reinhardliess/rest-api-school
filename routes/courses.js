'use strict';

const express = require('express');
const router = express.Router();

const db = require('../db');
const { attrib, Sequelize } = db;
const { Course, User } = db.models;
const { asyncHandler, courseHandler, authenticateUser } = require('../lib/utils')

// Query options for GET with included user
const options = {
  attributes: attrib.course,
  include: [{
    attributes: attrib.user,
    model: User,
    where: { id: Sequelize.col('Course.userId') }
  }]
};

// GET - get all courses with user owning the course
router.get('/', asyncHandler(async (req, res) => {
  const courses = await Course.findAll(options);
  if (courses) {
    res.status(200).json({ courses });
  } else {
    res.status(404).end();
  }
}));

// GET - get course with id with user owning the course
router.get('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const course = await Course.findByPk(id, options);
  if (course) {
    res.status(200).json({ course });
  } else {
    res.status(404).end();
  }
}));

// POST - add a course
router.post('/', asyncHandler(authenticateUser), asyncHandler(async (req, res) => {
  // Get the user from the request body.
  const course = await Course.create(req.body);
  res.location(`/api/courses/${course.id}`);
  // Set the status to 201 Created and end the response.
  res.status(201).end();
}));

// PUT - update a course
router.put('/:id', asyncHandler(authenticateUser), asyncHandler(async (req, res, next) => {

  courseHandler(req, res, next, async (course) => {
    // Validaton
    const required = ['title', 'description'];
    const errors = [];

    for (const field of required) {
      if (!req.body[field]) {
        const objErr = {
          message: `Course.${field} cannot be null`,
          type: 'notNull Violation',
          path: `${field}`,
          value: null
        }
        errors.push(objErr);
      }
    }
    if (errors.length) {
      res.status(400).json({ errors });
      return false
    } else {
      await course.update(req.body);
      return true
    }
  })
}));

// DELETE - delete a course
router.delete('/:id', asyncHandler(authenticateUser), asyncHandler(async (req, res, next) => {
  courseHandler(req, res, next, async (course) => {
    await course.destroy();
  })
}));

module.exports = router;
