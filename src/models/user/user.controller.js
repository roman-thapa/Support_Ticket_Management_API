const userService = require("./user.service");
const asyncHandler = require("../../utils/asyncHandler");
const AppError = require("../../utils/appError");

const {
  createUserSchema,
  idParamSchema,
} = require("../../validations/user.validation");


// Create User (Admin)
exports.createUser = asyncHandler(async (req, res) => {
  const validation = createUserSchema.safeParse(req.body);

  if (!validation.success) {
    throw new AppError(validation.error.errors[0].message, 400);
  }

  const user = await userService.createUser(validation.data);

  return res.status(201).json({
    success: true,
    data: user,
  });
});


// Get User By ID (Admin)
exports.getUserById = asyncHandler(async (req, res) => {
  const validation = idParamSchema.safeParse(req.params);

  if (!validation.success) {
    throw new AppError(validation.error.errors[0].message, 400);
  }

  const user = await userService.getUserById(validation.data.id);

  return res.status(200).json({
    success: true,
    data: user,
  });
});


// Get All Users (Admin)
exports.getAllUsers = asyncHandler(async (req, res) => {
  const users = await userService.getAllUsers();

  return res.status(200).json({
    success: true,
    data: users,
  });
});


// Get Profile (Logged-in User)
exports.getProfile = asyncHandler(async (req, res) => {
  const userId = req.user.userId;

  const user = await userService.getUserById(userId);

  return res.status(200).json({
    success: true,
    data: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
});