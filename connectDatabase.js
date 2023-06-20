const mongoose = require("mongoose");

const connectDatabase = () => {
  mongoose
    .connect(
      "mongodb+srv://indyteindia:NyjyXuTxa1WXTiu1@cluster0.mwc4ecv.mongodb.net/?retryWrites=true&w=majority",
      { useNewUrlParser: true }
    )
    .then((data) => {
      console.log(`mongodb connected with server : ${data.connection.host}`);
    });
};

module.exports = connectDatabase;
