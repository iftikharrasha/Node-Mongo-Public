const mongoose = require('mongoose');
const uri = `${process.env.APP_DATABASE_URI}`;

const mongooseConnect = async () => {
  try {
    const conn = await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Succeeded to connect to mongodb server');
    return conn.connection.db;
  } catch (error) {
    console.log(error);
  }
};

module.exports = mongooseConnect;
