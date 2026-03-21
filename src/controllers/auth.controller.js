import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { Resend } from "resend";
import bcrypt from "bcrypt";

const createToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
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
    const isProduction = process.env.NODE_ENV === "production";

    res
      .cookie("token", token, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .status(201)
      .json({
        message: "User registered",
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
    const isProduction = process.env.NODE_ENV === "production";

    res
      .cookie("token", token, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .status(200)
      .json({
        message: "User logged in",
        user: userData,
      });
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

const logout = async (req, res) => {
  try {
    const isProduction = process.env.NODE_ENV === "production";

    res
      .clearCookie("token", {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
      })
      .status(200)
      .json({
        message: "User logged out successfully",
      });
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);

    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const otp = generateOtp();

    user.resetOtp = otp;
    user.resetOtpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    user.resetOtpVerified = false;

    await user.save();

    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: user.email,
      subject: "Password Reset OTP",
      html: `
        <h2>Password Reset</h2>
        <p>Your OTP is:</p>
        <h1>${otp}</h1>
        <p>This code will expire in 10 minutes.</p>
      `,
    });

    return res.status(200).json({
      message: "OTP sent to email",
    });
  } catch (error) {
    console.error("forgotPassword error:", error);

    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

const verifyResetOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        message: "Email and OTP are required",
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(400).json({
        message: "User not found",
      });
    }

    if (!user.resetOtp || !user.resetOtpExpiresAt) {
      return res.status(400).json({
        message: "No OTP found",
      });
    }

    if (user.resetOtp !== otp) {
      return res.status(400).json({
        message: "Invalid OTP",
      });
    }

    if (user.resetOtpExpiresAt < new Date()) {
      return res.status(400).json({
        message: "OTP has expired",
      });
    }

    user.resetOtpVerified = true;
    await user.save();

    return res.status(200).json({
      message: "OTP verified successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, otp, password, confirmPassword } = req.body;

    if (!email || !otp || !password || !confirmPassword) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        message: "Passwords do not match",
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(400).json({
        message: "User not found",
      });
    }

    if (!user.resetOtp || !user.resetOtpExpiresAt) {
      return res.status(400).json({
        message: "No OTP found",
      });
    }

    if (user.resetOtp !== otp) {
      return res.status(400).json({
        message: "Invalid OTP",
      });
    }

    if (user.resetOtpExpiresAt < new Date()) {
      return res.status(400).json({
        message: "OTP has expired",
      });
    }

    if (!user.resetOtpVerified) {
      return res.status(400).json({
        message: "OTP not verified",
      });
    }

    user.password = password;
    user.resetOtp = undefined;
    user.resetOtpExpiresAt = undefined;
    user.resetOtpVerified = false;

    await user.save();

    return res.status(200).json({
      message: "Password reset successful",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

const changePassword = async (req, res) => {
  try {
    const userId = req.userId;
    const { currentPassword, password, confirmPassword } = req.body;

    if (!currentPassword || !password || !confirmPassword) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        message: "Passwords do not match",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(400).json({
        message: "User not found",
      });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({
        message: "Current password is incorrect",
      });
    }

    user.password = password;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};
export {
  signup,
  login,
  logout,
  forgotPassword,
  verifyResetOtp,
  resetPassword,
  changePassword,
};
