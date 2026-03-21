import { User } from "../models/user.model.js";
import bcrypt from "bcrypt";
import { Resend } from "resend";

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

const updateUser = async (req, res) => {
  try {
    const userId = req.userId;

    const {
      firstName,
      lastName,
      phone,
      address,
      dateOfBirth,
      region,
      province,
      city,
      barangay,
      zipCode,
    } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(400).json({
        message: "User not found",
      });
    }

    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (phone) user.phone = phone;
    if (address) user.address = address;
    if (dateOfBirth) user.dateOfBirth = dateOfBirth;

    if (region) user.address.region = region;
    if (province) user.address.province = province;
    if (city) user.address.city = city;
    if (barangay) user.address.barangay = barangay;
    if (zipCode) user.address.zipCode = zipCode;

    await user.save();

    const updateUser = await User.findById(userId).select("-password");

    return res.status(200).json({
      message: "Updated successfully",
      user: updateUser,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

const requestEmailChange = async (req, res) => {
  try {
    const userId = req.userId;
    const { email, password } = req.body;

    const resend = new Resend(process.env.RESEND_API_KEY);

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(400).json({
        message: "User not found",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Incorrent Password",
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser && existingUser._id.toString() !== userId) {
      return res.status(400).json({
        message: "Email already in use",
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.pendingEmail = email;
    user.emailChangeOtp = otp;
    user.emailChangeOtpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await user.save();

    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: user.pendingEmail,
      subject: "Verify your new email",
      html: `
        <h2>Verify your new email</h2>
        <p>Your OTP is:</p>
        <h1>${otp}</h1>
        <p>This code will expire in 10 minutes.</p>
      `,
    });

    return res.status(200).json({
      message: "OTP sent to your new email",
      requiresOtp: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server error",
      error: error.message,
    });
  }
};

const verifyEmailChange = async (req, res) => {
  try {
    const userId = req.userId;
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        message: "Email and OTP are required",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (user.pendingEmail !== email) {
      return res.status(400).json({
        message: "Invalid email verification request",
      });
    }

    if (user.emailChangeOtp !== otp) {
      return res.status(400).json({
        message: "Invalid OTP",
      });
    }

    if (
      !user.emailChangeOtpExpiresAt ||
      user.emailChangeOtpExpiresAt < new Date()
    ) {
      return res.status(400).json({
        message: "OTP has expired",
      });
    }

    user.email = user.pendingEmail;
    user.pendingEmail = undefined;
    user.emailChangeOtp = undefined;
    user.emailChangeOtpExpiresAt = undefined;

    await user.save();

    return res.status(200).json({
      message: "Email updated successfully",
      user: {
        email: user.email,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

export { updateUser, getMe, requestEmailChange, verifyEmailChange };
