const mongoose = require("mongoose");

const connectDatabase = () => {
  mongoose
    .connect(
      "mongodb+srv://bansallakshay081:Dl3AErJFwbA2Fckl@indyte-test.nk6g6sj.mongodb.net/indyte",
      { useNewUrlParser: true }
    )
    .then((data) => {
      console.log(`mongodb connected with server : ${data.connection.host}`);
    });
};

module.exports = connectDatabase;
