const express = require("express");
const app = express();
const errorMiddleware = require("./middleware/error");
var bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
app.use(bodyParser.json());
require("dotenv").config();

const fileUpload = require("express-fileupload");
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.json());
app.use(cookieParser());
app.use(
  fileUpload({
    useTempFiles: true,
  })
);
var cors = require("cors");
const { application } = require("express");

app.use(cors());
app.get("/health", (req, res, next) => {
  res.send("OK");
});
app.use(errorMiddleware);
module.exports = app;
