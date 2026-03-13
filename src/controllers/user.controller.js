import { User } from "../models/user.model.js";

const registerUser = async (req, res) => {
  try {
    const { username, password, email } = req.body;

    if (!username || !password || !email) {
      return res.status(400).json({ message: "All fields are required!" });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    console.log("Checking email:", normalizedEmail);

    const exisiting = await User.findOne({ email: normalizedEmail });

    if (exisiting) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({
      email: normalizedEmail,
      username,
      password,
      loggedIn: false,
    });

    res.status(202).json({
      message: "User registered",
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

const loginUser = async (req, res) => {
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

    res.status(200).json({
      message: "User logged in",
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

export { registerUser, loginUser };
