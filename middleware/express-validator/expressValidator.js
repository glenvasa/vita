const { check } = require("express-validator");

module.exports.registerUserValidator = [
  check("name", "Name is empty").not().isEmpty(),
  check("lastName", "Last name is empty").not().isEmpty(),
  check("userName", "Username is empty").not().isEmpty(),
  check("email", "Email is not a valid email address").isEmail(),
  check(
    "password",
    "Password needs to contain between 6 and 12 alphanumeric characters"
  ).isLength({ min: 6, max: 12 }),
];

module.exports.loginUserValidator = [
  check("email", "Email is not a valid email address").isEmail(),
  check(
    "password",
    "Password needs to contain between 6 and 12 alphanumeric characters"
  ).isLength({ min: 6, max: 12 }),
];

module.exports.searchUserByUsernameValidator = [
  check("userNameFromSearch", "Search is empty").not().isEmpty(),
];

module.exports.changeUserDataValidator = [
  check("changeUserData", "Input is empty").not().isEmpty(),
];

module.exports.checkActualPasswordValidator = [
  check(
    "passwordToCheck",
    "Password should be between 6 and 12 characters"
  ).isLength({ min: 6, max: 12 }),
];

module.exports.changeUserPasswordValidator = [
  check(
    "newPassword",
    "New password should be between 6 and 12 characters"
  ).isLength({ min: 6, max: 12 }),
];
