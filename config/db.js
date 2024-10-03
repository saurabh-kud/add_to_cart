const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = async () => {
  try {
    mongoose.set("strictQuery", false);
    const res = await mongoose.connect(process.env.DB_CONNECTIN);
    console.log(
      "database connected",
      res.connection.host,
      ", db name: ",
      res.connection.name
    );
  } catch (error) {
    console.log(error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
