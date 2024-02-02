import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      // unique:true,
    },
    avatar: {
      type: String,
      default: "https://www.gravatar.com/avatar/",
    },
  },
  { timestamps: true }
);
const User = mongoose.model("User", userSchema);

export default User;
