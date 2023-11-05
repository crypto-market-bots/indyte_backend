const app = require("./app.js");
const dotenv = require("dotenv");
const connectDatabase = require("./connectDatabase");
const newCron =require('./cron.js')

newCron.updateMealStatus()

const server = app.listen(8080, () => {
  console.log(`Server is port on the ${8080}`);
});
connectDatabase();

process.on("unhandledRejection", (err) => {
  console.log(`Errror: ${err.message}`);
  console.log(`Shutting down the server due to Unhandled rejection`);
});
