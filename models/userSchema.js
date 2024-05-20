import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, "Name Required!"],
  },
  email: {
    type: String,
    required: [true, "Email Required!"],
  },
  phone: {
    type: String,
    required: [true, "Phone Number Required!"],
  },
  aboutMe: {
    type: String,
    required: [true, "About me field is Required!"],
  },
  password: {
    type: String,
    required: [true, "Password is Required!"],
    minLength: [8, "password must be contain at least 8 Characters!"],
    select: false,
  },
  avatar: {
    public_id: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
  },
  resume: {
    public_id: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
  },
  portfolioURL: {
    type: String,
    required: [true, "required"],
  },
  githubURL: String,
  instagramURL: String,
  twitterURL: String,
  facebookURL: String,
  linkedInURL: String,
  resetPasswordToken: String,
  resetPasswrodExpire: Date,
});

//! for hashing password
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  this.password = await bcrypt.hash(this.password, 10);
});
//! for comparing pass with hash pass
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};
//! generating JSON web token
userSchema.methods.generateJsonWebToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRECT_KEY, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

userSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString("hex");
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.resetPasswrodExpire = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

export const User = mongoose.model("User", userSchema);
