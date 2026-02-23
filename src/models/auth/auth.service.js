const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const AppError = require("../utils/appError");
const userRepository = require("../user/user.repository");

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined");
}

const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10;

/* =========================
   SIGNUP
========================= */
exports.signup = async ({ name, email, password, role }) => {

  const existingUser = await userRepository.findByEmail(email);

  if (existingUser) {
    throw new AppError("Email already exists", 409);
  }

  const hashedPassword = await bcrypt.hash(password, saltRounds);

  const user = await userRepository.create({
    name,
    email,
    password: hashedPassword,
    role,
  });

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    created_at: user.created_at,
  };
};

/* =========================
   LOGIN
========================= */
exports.login = async ({ email, password }) => {

  const user = await userRepository.findByEmail(email);

  // Do NOT reveal whether email exists (security best practice)
  if (!user) {
    throw new AppError("Invalid credentials", 401);
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new AppError("Invalid credentials", 401);
  }

  const token = jwt.sign(
    {
      userId: user.id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
};