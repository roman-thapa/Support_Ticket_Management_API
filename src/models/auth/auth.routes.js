const express = require('express');
const router = express.Router();
const authController = require('./auth.controller');
const validate = require("../../middlewares/validate");
const { registerSchema, loginSchema} = require("../../validations/auth.validation")

router.post(
  "/signup",
  validate(registerSchema),
  authController.signup
);

router.post(
  "/login",
  validate(loginSchema),
  authController.login
);

module.exports = router;