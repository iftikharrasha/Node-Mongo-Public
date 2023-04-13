const dotenv = require('dotenv').config();
const dbConnect = require('./src/utils/dbConnect.js');
const { initiateSocket } = require('./src/utils/initiateSocket.js');
const app = require("./app");

const port = process.env.PORT || 5000;

//connect database and start socket server
dbConnect.connectToServer()
  .then((db) => {
    initiateSocket(app, db, port);
  })
  .catch((err) => {
    console.log(err);
  });