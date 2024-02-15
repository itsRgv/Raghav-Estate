import User from "../models/user.model.js";
import { errorHandler } from "../utils/error.js";
import bcryptjs from "bcryptjs";
import Listing from "../models/listing.model.js";

export const test = (req, res) => {
  res.send("Hello World");
}; // Path: api/routes/user.route.js

export const deleteUser = async (req, res, next) => {
  if (req?.user?.id !== req?.params?.id) {
    return next(errorHandler(401, "You can delete your own account only!"));
  }
  try {
    await User.findByIdAndDelete(req?.params?.id);
    res.clearCookie("access_token");
    res.status(200).json("User deleted successfully...");
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  // console.log(req);
  if (req?.user?.id !== req?.params?.id) {
    return next(errorHandler(401, "You can update your own account only!"));
  }
  try {
    // update user
    if (req?.body?.password) {
      req.body.password = bcryptjs.hashSync(req?.body?.password, 10);
    }

    const updatedUser = await User.findByIdAndUpdate(
      req?.params?.id,
      {
        $set: {
          username: req?.body?.username,
          email: req?.body?.email,
          password: req?.body?.password,
          avatar: req?.body?.avatar,
        },
      },
      { new: true }
    );
    const { password, ...rest } = updatedUser._doc;

    res.status(200).json(rest);
  } catch (error) {
    next(error);
  }
};

export const showListings = async (req, res, next) => {
  // console.log(req.user);
  if (req.params.id === req.user.id) {
    try {
      const listings = await Listing.find({ userRef: req.params.id });
      res.status(200).json(listings);
    } catch (error) {
      next(error);
    }
  } else {
    return next(errorHandler(401, "You can only view your own listings!"));
  }
};
