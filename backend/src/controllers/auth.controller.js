import Users from "../models/User.js";
import bcrypt from "bcrypt";
import generateToken from "../utils/generateToken.js";
import logger from "../middleware/logger.js";

// Register
export const register = async (req, res) => {
  try {
    logger.debug("Register attempt started", { email: req.body.email });

    const { name, email, password, role } = req.body;

    // cek user
    logger.debug("Checking if user exists", { email });
    const userExist = await Users.findOne({ email });

    if (userExist) {
      logger.warn("Registration failed - User already exists", { email });
      return res.status(400).json({ message: "User already exist" });
    }

    logger.debug("User does not exist, proceeding with registration");

    // hash password
    logger.debug("Hashing password");
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // simpan user baru
    logger.debug("Creating new user in database", {
      email,
      role: role || "user",
    });
    const user = await Users.create({
      name,
      password: hashedPassword,
      email,
      role: role || "user",
    });

    logger.info("User registered successfully", {
      userId: user._id,
      email: user.email,
      role: user.role,
    });

    // kirim respon ke json
    res.status(201).json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id, user.role),
    });
  } catch (error) {
    logger.error("Registration failed", {
      error: error.message,
      stack: error.stack,
      email: req.body.email,
    });

    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// login
export const login = async (req, res) => {
  try {
    logger.debug("Login attempt started", { email: req.body.email });

    const { email, password } = req.body;

    // cek user
    logger.debug("Finding user by email", { email });
    const user = await Users.findOne({ email }).select("+password");

    if (!user) {
      logger.warn("Login failed - User not found", { email });
      return res.status(401).json({ message: "Invalid email" });
    }

    logger.debug("User found, validating password", { userId: user._id });

    // cek password
    const comparePassword = await bcrypt.compare(password, user.password);

    if (!comparePassword) {
      logger.warn("Login failed - Invalid password", {
        userId: user._id,
        email: user.email,
      });
      return res.status(401).json({ message: "Invalid password" });
    }

    logger.info("User logged in successfully", {
      userId: user._id,
      email: user.email,
      role: user.role,
    });

    // kalau cocok generate token
    res.status(200).json({
      success: true,
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id, user.role),
    });
  } catch (error) {
    logger.error("Login error occurred", {
      error: error.message,
      stack: error.stack,
      email: req.body.email,
    });

    res.status(500).json({ message: "Failed to login", error: error.message });
  }
};
