# REST API for a school database

In this project for the Treehouse techdegree, I created a REST API using Express. The API provides a way for users to administer a school database containing information about courses: users can interact with the database by retrieving a list of courses, as well as adding, updating and deleting courses in the database.

In addition, users are required to create an account and log-in to make changes to the database.

## Technologies Used

- Node.js
- Express
- Sequelize ORM
- SQL
- REST API design
- JavaScript

## Installation

- Download or clone from Github
- Run `npm install`
- Run `npm run seed`
- Set the environment variable `RESTAPI_DB` if necessary (see below)
- Run the app

## Available npm scripts

### `npm run seed`

- Seeds the SQLITE database

### `npm start`

- Runs app

### `npm run start_local`

- Runs app via nodemon

### `npm run debug`

- Runs app via nodemon in inspect mode for debugging in Visual Studio Code or Google Chrome

The environment variable `RESTAPI_DB` must be set to the SQLITE database `./fsjstd-restapi.db`. This is already configured in `nodemon.json` for development purposes.  

## REST API Endpoints

### User

- `GET /api/users 200` - Returns the currently authenticated user
- `POST /api/users 201` - Creates a user, sets the Location header to "/", and returns no content

### Course

- `GET /api/courses 200` - Returns a list of courses (including the user that owns each course)
- `GET /api/courses/:id 200` - Returns the course (including the user that owns the course) for the provided course ID
- `POST /api/courses 201` - Creates a course, sets the Location header to the URI for the course, and returns no content (Authentication required)
- `PUT /api/courses/:id 204` - Updates a course and returns no content (Authentication required)
- `DELETE /api/courses/:id 204` - Deletes a course and returns no content  (Authentication required)
- The `PUT /api/courses/:id` and `DELETE /api/courses/:id` routes return a 403 status code if the current user doesn't own the requested course

### General remarks

- The following properties are filtered out: `password`, `createdAt`, `updatedAt`
- If a course or a route isn't found a 404 status is returned and no content

### Tests

- The [RESTAPI.postman_collection.json](./tests/RESTAPI.postman_collection.json) file is a collection of Postman requests that can be used to test the REST API.
- The [api.http](./tests/api.http) file serves the same purpose and can be used with the Visual Studio Code [REST Client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client) extension. It uses variables, so it can also be used to test a deployed version.
- The [gen-data.js tool](./helpers/README.md) in `./helpers` can be used to generate test data.

## Error Messages

- Error messages are always returned in an array of error objects

### Validation

- User: `firstName`, `lastName`, `emailAddress`, `password` are required
- Course: `title`, `description`, `userId` are required
- `emailAddress` must be unique and a valid email address
- `password` must be at least 8 characters long

### Validation Errors

- Validation errors are routed through from Sequelize and return the properties: `message`, `type`, `path`, `value`. This enables a client application to create their own error messages if required.

Example:

```json
{
  "errors": [
    {
      "message": "User.password cannot be null",
      "type": "notNull Violation",
      "path": "password",
      "value": null
    }
  ]
}
```

### Other Errors

- Other errors return the properties: `message`, `type`

Example:

```json
{
  "errors": [
    {
      "message": "Unexpected token f in JSON at position 5",
      "type": "SyntaxError"
    }
  ]
}
```
