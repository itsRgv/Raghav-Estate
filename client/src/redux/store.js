import { configureStore } from "@reduxjs/toolkit";
// import { get } from "mongoose";
import userReducer from "./user/userSlice";

export const store = configureStore({
  reducer: { userReducer },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});
