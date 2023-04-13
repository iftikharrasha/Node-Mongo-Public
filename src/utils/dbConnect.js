// https://github.com/Abdify/inventory-management-acc
// https://github.com/Abdify/express-mvc-acc

const { MongoClient } = require('mongodb');
const uri = `mongodb+srv://${process.env.REACT_APP_USERNAME}:${process.env.REACT_APP_PASSWORD}@cluster0.ce7h0.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

let dbConnection;
module.exports = {
  connectToServer: function () {
    return new Promise((resolve, reject) => {
      client.connect(function (err, db) {
        if (err) {
          reject(err);
        } else {
          dbConnection = db.db('E24Games');
          console.log('succeeded to connect to mongodb server');
          resolve(dbConnection);
        }
      });
    });
  },

  getDb: function (){
    return dbConnection;
  },
};