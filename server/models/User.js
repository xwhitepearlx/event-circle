import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "User name is required."]
  },
  email: {
    type: String,
    required: [true, "Email is required."],
    unique: true
  },
  password: {
    type: String,
    required: [true, "Password is required."]
  }
});

export const User = mongoose.model("User", userSchema);
