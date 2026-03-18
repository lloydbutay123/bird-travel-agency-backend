import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";

const createToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

const signup = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, password, confirmPassword } =
      req.body;

    if (
      !firstName ||
      !lastName ||
      !password ||
      !email ||
      !phone ||
      !confirmPassword
    ) {
      return res.status(400).json({ message: "All fields are required!" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        message: "Passwords do not match!",
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    console.log("Checking email:", normalizedEmail);

    const exisitng = await User.findOne({ email: normalizedEmail });

    if (exisitng) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({
      email: normalizedEmail,
      firstName,
      lastName,
      phone,
      password,
      loggedIn: false,
    });

    const token = createToken(user._id);

    res.status(201).json({
      message: "User registered",
      token,
      user: {
        _id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const normalizedEmail = String(email).trim().toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user)
      return res.status(400).json({
        message: "User not found",
      });

    const isMatch = await user.comparePassword(password);
    if (!isMatch)
      return res.status(400).json({
        message: "Invalid credentials",
      });

    const token = createToken(user._id);
    const userData = await User.findById(user._id).select("-password");

    res.status(200).json({
      message: "User logged in",
      token,
      user: userData,
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};

export { signup, login, getMe };
