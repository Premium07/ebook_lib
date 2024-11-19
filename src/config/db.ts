import mongoose from "mongoose";
import { config } from "./config";

const connectDB = async () => {
  try {
    mongoose.connection.on("connected", () => {
      console.log(`Database connection successfull.`);
    });

    mongoose.connection.on("error", (err) => {
      console.log(`Error in connecting to Database, ${err}`);
    });

    await mongoose.connect(config.mongo_uri as string);
  } catch (err) {
    console.log(`failed to connect database, ${err}`);
    process.exit(1);
  }
};

export default connectDB;
