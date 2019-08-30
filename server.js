const express = require("express");
const helmet = require("helmet");
const cors = require("cors");

const jwt = require("jsonwebtoken");

const userRouter = require("./users/user-router");

const server = express();

server.get("/", (req, res) => {
  res.send("It works");
});

server.use(helmet());
server.use(express.json());
server.use(cors());

server.use(userRouter);

module.exports = server;
