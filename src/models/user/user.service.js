const bcrypt = require('bcrypt');
const userRepository = require('./user.repository');

const ALLOWED_ROLES = ['user', 'agent', 'admin'];

exports.createUser = async (data) => {
  const { name, email, password, role = 'user' } = data;

  if (!name || !email || !password) {
    throw new Error('Name, email and password are required');
  }

  if (!ALLOWED_ROLES.includes(role)) {
    throw new Error('Invalid role');
  }

  const existingUser = await userRepository.findByEmail(email);
  if (existingUser) {
    throw new Error('Email already exists');
  }

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
    throw new Error('User ID is required');
  }

  const user = await userRepository.findById(id);

  if (!user) {
    throw new Error('User not found');
  }

  return user;
};

exports.getAllUsers = async () => {
  const users = await userRepository.findAll();
  return users;
};
