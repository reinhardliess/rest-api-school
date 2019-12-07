'use strict';
/******************************************
Treehouse Techdegree:
FSJS project #9 - REST API w/ Express
Reinhard Liess, 2019
******************************************/

// load modules
const express = require('express');
const morgan = require('morgan');

// import routes
const indexRouter = require('./routes/index');
const userRouter = require('./routes/users');
const courseRouter = require('./routes/courses');

// variable to enable global error logging
const enableGlobalErrorLogging = process.env.ENABLE_GLOBAL_ERROR_LOGGING === 'true';

// create the Express app
const app = express();

// setup morgan which gives us http request logging
app.use(morgan('dev'));

// Setup request body JSON parsing.
app.use(express.json());

// Api routes
app.use('/', indexRouter);
app.use('/api/users', userRouter);
app.use('/api/courses', courseRouter);

// send 404 if no other route matched
app.use((req, res) => {
  res.status(404).end();
});

// setup a global error handler
app.use((err, req, res, next) => {
  if (enableGlobalErrorLogging) {
    console.error(`Global error handler: ${JSON.stringify(err.stack)}`);
  }

  res.status(err.status || 500).json({
    message: err.message,
    type: err.constructor.name
  });
});

// set our port
app.set('port', process.env.PORT || 5000);

// start listening on our port
const server = app.listen(app.get('port'), () => {
  console.log(`Express server is listening on port ${server.address().port}`);
});
