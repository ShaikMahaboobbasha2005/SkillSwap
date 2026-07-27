const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const createError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    }
  );
};

const signupUser = async ({ name, email, password }) => {
  const normalizedEmail = email.toLowerCase().trim();

  // Check for duplicate email
  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    throw createError("Email already registered", 409);
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  // Create user
  const newUser = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    passwordHash,
  });

  // Generate JWT token
  const token = generateToken(newUser);

  // Fetch user object excluding passwordHash
  const userWithoutPassword = await User.findById(newUser._id).select("-passwordHash").lean();

  return {
    user: userWithoutPassword,
    token,
  };
};

const loginUser = async ({ email, password }) => {
  const normalizedEmail = email.toLowerCase().trim();

  // Find user
  const user = await User.findOne({ email: normalizedEmail });
  if (!user) {
    throw createError("Invalid credentials", 401);
  }

  // Compare password
  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    throw createError("Invalid credentials", 401);
  }

  // Generate JWT token
  const token = generateToken(user);

  // Exclude passwordHash
  const userWithoutPassword = await User.findById(user._id).select("-passwordHash").lean();

  return {
    user: userWithoutPassword,
    token,
  };
};

const getCurrentUser = async (userId) => {
  const user = await User.findById(userId).select("-passwordHash").lean();
  if (!user) {
    throw createError("User not found", 404);
  }
  return user;
};

module.exports = {
  signupUser,
  loginUser,
  getCurrentUser,
};
