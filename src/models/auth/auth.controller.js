const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/appError");
const authService = require("./auth.service");

exports.signup = asyncHandler(async (req, res) => {
  const user = await authService.signup(req.validatedData);

  return res.status(201).json({
    success: true,
    data: user,
  });
});

exports.login = asyncHandler(async (req, res) => {
  const loginResult = await authService.login(req.validatedData);

  return res.status(200).json({
    success: true,
    data: loginResult,
  });
});