import { User } from "../models/user.model.js";

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

    const { firstName, lastName, phone, address, email } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.json({
        message: "User not found",
      });
    }

    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (phone) user.phone = phone;
    if (address) user.address = address;
    if (email) user.email = email;

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

export { updateUser, getMe };
