const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userRepository = require('../user/user.repository');

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined');
}

const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10;

/* =========================
   SIGNUP
========================= */
exports.signup = async ({ name, email, password, role }) => {
  if (!name || !email || !password) {
    const error = new Error('Name, email and password are required');
    error.statusCode = 400;
    throw error;
  }

  const existingUser = await userRepository.findByEmail(email);

  if (existingUser) {
    const error = new Error('Email already exists');
    error.statusCode = 409;
    throw error;
  }

  const hashedPassword = await bcrypt.hash(password, saltRounds);

  const user = await userRepository.create({
    name,
    email,
    password: hashedPassword,
    role
  });

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    created_at: user.created_at
  };
};


/* =========================
   LOGIN
========================= */
exports.login = async ({ email, password }) => {
  if (!email || !password) {
    const error = new Error('Email and password are required');
    error.statusCode = 400;
    throw error;
  }

  const user = await userRepository.findByEmail(email);

  if (!user) {
    const error = new Error('Invalid credentials');
    error.statusCode = 401;
    throw error;
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    const error = new Error('Invalid credentials');
    error.statusCode = 401;
    throw error;
  }

  const token = jwt.sign(
    {
      userId: user.id,
      role: user.role
    },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );


  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  };
};