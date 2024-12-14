import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, "Full name is required"],
  },
  username: {
    type: String,
    unique: true,
    required: [true, "Username is required"],
  },
  email: {
    type: String,
    unique: true,
    required: [true, "Email is required"],
  },
  phone: {
    type: String,
    required: [true, "Phone is required"],
  },
  password: {
    type: String,
    required: [true, "Password is required"],
  },
  usedStorage: {
    type: Number,
    default: 0,
  },
  userPlan: {
    type: String,
    default: "Free",
    enum: ["Free", "Silver", "Gold", "Platinum"],
  },
  userPlanExpiry: Date,
  userPlanStartDate: Date,
  userEvents: {
    type: Array,
    default: [],
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  verifyToken: String,
  verifyTokenExpiry: Date,
  recoverytoken: String,
  isAdmin: {
    type: Boolean,
    default: false,
  },
});

const User = mongoose.models.users || mongoose.model("users", userSchema);

export default User;
