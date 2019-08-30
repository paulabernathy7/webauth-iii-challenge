const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");

const jwt = require("jsonwebtoken");
const secrets = require("../secrets");

const Users = require("./user-model");

router.post("/api/register", async (req, res) => {
  const user = req.body;
  const hash = bcrypt.hashSync(user.password, 10);
  user.password = hash;
  try {
    const users = await Users.add(user);
    res.status(201).json(users);
  } catch (err) {
    res.status(500).json(err.message);
  }
});

router.post("/api/login", (req, res) => {
  const { username, password } = req.body;

  Users.findBy({ username })
    .first()
    .then(user => {
      console.log(user);
      if (user && bcrypt.compareSync(password, user.password)) {
        const token = genToken(user);

        res.status(201).json({ message: `welcome ${username}`, token });
      } else {
        res.status(401).json({ message: "You shall not pass" });
      }
    })
    .catch(err => {
      res.status(500).json(err);
      console.log(err);
    });
});

router.get("/api/users", restricted, (req, res) => {
  Users.find()
    .then(users => {
      res.json(users);
    })
    .catch(err => res.send(err));
});

function genToken(user) {
  const payload = {
    subject: user.id,
    username: user.username
  };
  //   const secrets = secrets.jwtSecret;

  const options = {
    expiresIn: "1h"
  };

  return jwt.sign(payload, secrets.jwtSecret, options);
}

function restricted(req, res, next) {
  const header = req.headers["authorization"];

  if (typeof header !== "undefined") {
    const bearer = header.split(" ");
    const token = bearer[1];

    req.token = token;
    next();
  } else {
    //If header is undefined return Forbidden (403)
    res.status(401).json({ message: "You shall not pass" });
  }
}

module.exports = router;
