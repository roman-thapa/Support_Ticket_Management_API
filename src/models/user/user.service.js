const bcrypt = require('bcrypt');
const userRepository = require('./user.repository');
const AppError = require('../../utils/appError');

const ALLOWED_ROLES = ['user', 'agent', 'admin'];

exports.createUser = async (data) => {
  const { name, email, password, role = 'user' } = data;

  // ✅ Required fields
  if (!name || !email || !password) {
    throw new AppError('Name, email and password are required', 400);
  }

  // ✅ Role validation
  if (!ALLOWED_ROLES.includes(role)) {
    throw new AppError('Invalid role', 400);
  }

  // ✅ Duplicate email check
  const existingUser = await userRepository.findByEmail(email);
  if (existingUser) {
    throw new AppError('Email already exists', 409); // Conflict
  }

  // ✅ Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await userRepository.create({
    name,
    email,
    password: hashedPassword,
    role
  });

  return user;
};

exports.getUserById = async (id) => {
  if (!id) {
    throw new AppError('User ID is required', 400);
  }

  const user = await userRepository.findById(id);

  if (!user) {
    throw new AppError('User not found', 404);
  }

  return user;
};

exports.getAllUsers = async () => {
  const users = await userRepository.findAll();
  return users;
};