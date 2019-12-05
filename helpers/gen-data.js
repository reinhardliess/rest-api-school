'use strict'
const faker = require('faker');
const params = process.argv.slice(2);

// capitalize string
const capString = str => str.replace(/\b[a-z]/g, char => char.toUpperCase());

// get random integer between 2 integers, inclusive for both
const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const MAX_USERID = 5;
let obj;

if (params[0] === 'user') {
  obj = {
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
    emailAddress: faker.internet.email(),
    password: faker.internet.password()
  }
} else {
  obj = {
    title: capString(faker.fake("{{hacker.ingverb}} {{hacker.adjective}} {{hacker.noun}}")),
    description: faker.lorem.paragraph(),
    estimatedTime: `${getRandomInt(2, 16)} hours`,
    materialsNeeded: `${faker.commerce.productAdjective()} ${faker.commerce.productMaterial()}`,
    userId: `${getRandomInt(1, MAX_USERID)}`
  }
}

console.log(JSON.stringify(obj, null, 2))
