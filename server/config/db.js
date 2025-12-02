import mongoose from "mongoose";
import { uri, uri_local } from "./atlas_uri.js"

export const connectDB = async () => {
  try {
    await mongoose.connect(uri_local); // use cloud or local
    console.log("Connected to MongoDB");
  } catch (err) {
    console.log(`Connection failed: ${err.message}`);
    process.exit(1);
  }
};