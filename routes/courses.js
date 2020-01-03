const express = require('express');
const db = require('../db');
const {
  asyncHandler,
  courseHandler,
  authenticateUser,
  validateCourses,
} = require('../lib/utils');

const router = express.Router();
const { attrib, Sequelize } = db;
const { Course, User } = db.models;

// Query options for GET with included user
const options = {
  attributes: attrib.course,
  include: [
    {
      attributes: attrib.user,
      model: User,
      where: { id: Sequelize.col('Course.userId') },
    },
  ],
};

// GET - get all courses with user owning the course
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const courses = await Course.findAll(options);
    if (courses) {
      res.status(200).json({ courses });
    } else {
      res.status(404).end();
    }
  })
);

// GET - get course with id with user owning the course
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const course = await Course.findByPk(id, options);
    if (course) {
      res.status(200).json({ courses: [course] });
    } else {
      res.status(404).end();
    }
  })
);

// POST - add a course
router.post(
  '/',
  asyncHandler(authenticateUser),
  asyncHandler(async (req, res) => {
    // Get the user from the request body.
    const course = await Course.create(req.body);
    res
      .status(201)
      .location(`/api/courses/${course.id}`)
      .end();
  })
);

// PUT - update a course
router.put(
  '/:id',
  asyncHandler(authenticateUser),
  asyncHandler(async (req, res, next) => {
    courseHandler(req, res, next, async (course) => {
      // Validaton
      const errors = validateCourses(req);
      if (errors.length) {
        res.status(400).json({ errors });
        return false;
      }
      await course.update(req.body);
      return true;
    });
  })
);

// DELETE - delete a course
router.delete(
  '/:id',
  asyncHandler(authenticateUser),
  asyncHandler(async (req, res, next) => {
    courseHandler(req, res, next, async (course) => {
      await course.destroy();
      return true;
    });
  })
);

module.exports = router;
