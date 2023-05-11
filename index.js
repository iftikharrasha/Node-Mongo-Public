const dotenv = require('dotenv').config();
const { initiateSocket } = require('./src/utils/initiateSocket.js');
const mongooseConnect = require('./src/utils/mongooseConnect.js');

const app = require("./app");

const port = process.env.PORT || 5000;

//connect database with mongoose and start socket server
mongooseConnect()
  .then((db) => {
    initiateSocket(app, port);
  })
  .catch((err) => {
    console.log(err);
  });
