import mongoose  from "mongoose";
import config from "./config.js";


let connectToDB = async () => {
    await mongoose.connect(config.MONGO_URI)
    console.log("Connected to MongoDB");
}

export default connectToDB;