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
const users = require("./routes/user");
const common = require("./routes/common");
const sleepTracker = require("./routes/sleepTracker");
const progress = require("./routes/progress");
const workoutTracker = require("./routes/workoutTracker");
const waterAndFootTracker = require("./routes/waterAndFootTracker");
const mealPlanner = require("./routes/mealPlanner");
const dietitian = require("./routes/dietitian");
const exercises = require("./routes/exercises");
const equipment = require("./routes/equipment");


app.use("/api", users);
app.use("/api", common);
app.use("/api", sleepTracker);
app.use("/api", progress);
app.use("/api", workoutTracker);
app.use("/api", waterAndFootTracker);
app.use("/api", mealPlanner);
app.use("/api", dietitian);
app.use("/api", dietitian);
app.use("/api", equipment);
app.use("/api", exercises);
app.use(errorMiddleware);
module.exports = app;
