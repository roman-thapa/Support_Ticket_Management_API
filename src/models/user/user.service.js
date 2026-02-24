const bcrypt = require('bcrypt');
const userRepository = require('./user.repository');
const AppError = require('../../utils/appError');

exports.createUser = async ({ name, email, password, role = 'user' }) => {

  const existingUser = await userRepository.findByEmail(email);
  if (existingUser) {
    throw new AppError('Email already exists', 409);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  return await userRepository.create({
    name,
    email,
    password: hashedPassword,
    role
  });
};

exports.getUserById = async (id) => {
  const user = await userRepository.findById(id);

  if (!user) {
    throw new AppError('User not found', 404);
  }

  return user;
};

exports.getAllUsers = async () => {
  return await userRepository.findAll();
};