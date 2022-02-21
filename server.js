const dotenv = require("dotenv");
const express = require("express");
const ordersRouter = require("./routes/orders");

// Load config
dotenv.config();

// db connection
require("./db")();

const app = express();

//#region Middleware
// Body Parser Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Routes
app.use("/orders", ordersRouter);
//#endregion

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
