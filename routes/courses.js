'use strict';

const express = require('express');
const router = express.Router();

const db = require('../db');
const { attrib, sequelize, Sequelize } = db;
const { Course, User } = db.models;
const { asyncHandler, authenticateUser } = require('../lib/utils')

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
  res.status(200).json({ Courses: courses });
}));

// GET - get course with id with user owning the course
router.get('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const course = await Course.findByPk(id, options);
  if (course) {
    res.status(200).json({ course });
  }
}));

// POST - add a course
router.post('/', asyncHandler(authenticateUser), asyncHandler(async (req, res) => {
  try {
    // Get the user from the request body.
    const course = await Course.create(req.body);
    res.location(`/api/courses/${course.id}`);
    // Set the status to 201 Created and end the response.
    return res.status(201).end();
  } catch (error) {
    res.status(400).json(error);
  }
}));

// PUT - update a course
router.put('/:id', asyncHandler(authenticateUser), asyncHandler(async (req, res) => {

}));

// DELETE - delete a course
router.delete('/:id', asyncHandler(authenticateUser), asyncHandler(async (req, res) => {

}));

module.exports = router;
