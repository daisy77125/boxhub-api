const dotenv = require("dotenv");
const mongoose = require("mongoose");

// Load config
dotenv.config();

module.exports = async () => {
  try {
    await mongoose.connect(process.env.DB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Successfully connected to MongoDB...");
  } catch (err) {
    console.log("Could not connect to MongoDB\n", err);
    process.exit(1);
  }
};
