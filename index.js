const express = require("express");
const app = express();
const http = require("http");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const env = require("dotenv");
const { apiRouter } = require("./routes");

// load the env config
env.config();
//const hostname = '127.0.0.1';
const port = app.set("PORT", process.env.PORT || 3005);

const hostname = "0.0.0.0";
const server = http.createServer(app);

server.listen(app.get("PORT"), hostname);
server.on("error", onError);
server.on("listening", onListening);

function onError(error) {
  if (error.syscall !== "listen") {
    throw error;
  }

  const bind = typeof port === "string" ? "Pipe " + port : "Port " + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case "EACCES":
      console.error(bind + " requires elevated privileges");
      process.exit(1);
      break;
    case "EADDRINUSE":
      console.error(bind + " is already in use");
      process.exit(1);
      break;
    case "ECONNRESET":
      console.log(bind + "connection lost");
      process.exit(1);
      break;
    default: throw error;
  };
};

const corsOptions = {
  origin: '*',
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

// using the middlewares
app.use(express.json());// alternate for bodyparser
app.use(cookieParser());
app.use(cors(corsOptions));
app.use(express.urlencoded({ extended: true }));
// app.set("socketio", io);

//Routes START
app.use("/api", apiRouter);
app.use("/api/kisancreditcard/ping", (req, res) => {
  return res.status(200).json("OK");
});
//Routes END

app.use(function (err, req, res, next) {
  console.log("This is the invalid field ->", err.field);
  next(err);
});

// error handler middleware
app.use((error, req, res, next) => {
  res.status(error.status || 500).send({
    error: {
      status: error.status || 500,
      message: error.message || "Internal Server Error",
    },
  });
});

function onListening() {
  const addr = server.address();
  const bind = typeof addr === "string" ? "pipe " + addr : "port " + addr.port;
  console.log("Listening on " + bind);
  // console.log(process.env.NODE_ENV)
};

process.on("unhandledRejection", (reason, p) => {
  console.error(reason, "Unhandled Rejection at Promise", p);
}).on("uncaughtException", (err) => {
  console.error(err, "Uncaught Exception thrown");
  process.exit(1);
});