const express = require("express");
const app = express();
const errorMiddleware = require("./middleware/error");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const fileUpload = require("express-fileupload");
const cors = require("cors");

app.use(cors({
  origin: '*',
  methods: ['POST', 'GET', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(
  fileUpload({
    useTempFiles: true,
  })
);

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
