import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please use a valid email address"],
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    dateOfBirth: {
      type: Date,
      validate: {
        validator: function (value) {
          return !value || value <= new Date();
        },
        message: "Date of birth cannot be in the future",
      },
    },
    password: {
      type: String,
      required: true,
      minLength: 6,
    },
    address: {
      region: {
        type: String,
        trim: true,
        default: "",
      },
      province: {
        type: String,
        trim: true,
        default: "",
      },
      city: {
        type: String,
        trim: true,
        default: "",
      },
      barangay: {
        type: String,
        trim: true,
        default: "",
      },
      zipCode: {
        type: String,
        trim: true,
        default: "",
      },
    },
    loggedIn: {
      type: Boolean,
      default: false,
    },
    resetOtp: String,
    resetOtpExpiresAt: Date,
    resetOtpVerified: {
      type: Boolean,
      default: false,
    },
    pendingEmail: {
      type: String,
      default: null,
    },
    emailChangeOtp: {
      type: String,
      default: null,
    },
    emailChangeOtpExpiresAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

// before saving, we need to hash the password
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

// compare password
userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

export const User = mongoose.model("User", userSchema);
