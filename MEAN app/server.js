//order matters
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const http = require("http");
const app = require("./BackEnd/app");

//Error outside Express:
process.on("uncaughtException", (err) => {
  console.log("Uncaught Exception: Shutting down..");
  console.log(err.name, err.message);
  process.exit(1);
});

dotenv.config({ path: "./config.env" });

mongoose
  .connect(process.env.DB_LOCAL, {
    usenewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
  });

const port = process.env.PORT || 5000;
app.set("port", port);
const server = http.createServer(app);

server.listen(port, () => {
  console.log("Server started on port " + port);
});

//Errors outside Express:
process.on("unhandledRejection", (err) => {
  console.log("Unhandled rejection: Shutting down..");
  console.log(err.name, err.message);
  process.exit(1);
  // server.close(() => {
  //   process.exit(1);
  // });
});
