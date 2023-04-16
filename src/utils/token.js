const jwt = require('jsonwebtoken');
const uuid = require('uuid');

const generateToken = (userInfo) => {
  const secret = process.env.APP_TOKEN_SECRET;
  const options = { expiresIn: '24h' };
  const payload = {
      sub: userInfo._id,
      name: userInfo.userName,
      email: userInfo.emailAddress,
      typ: userInfo.permissions,
      photo: userInfo.photo,
  };

  // Create a access token
  const token = jwt.sign(payload, secret, options);
  return token;
};

const generateRefreshToken = () => {
  const refreshToken = uuid.v4();

  return refreshToken;
};

module.exports = {
  generateToken,
  generateRefreshToken
}