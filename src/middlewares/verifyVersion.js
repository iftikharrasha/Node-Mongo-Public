const jwt = require("jsonwebtoken");
const { promisify } = require("util");
/**
 * 1. check if token exists
 * 2. if not token send res
 * 3. decode the token
 * 4. if valid next
 */

module.exports = async (req, res, next) => {
  let response = {
      success: true,
      status: 200,
      signed_in: false,
      version: 1,
      data: [],
      error: null
  }
  try {
    const token = req.headers?.authorization?.split(" ")?.[1];

    if(!token){
      response.success = false;
      response.status = 401;
      response.error = {
          code: 400,
          message: "You are not authorized to access this",
          target: "Not logged in"
      }
      return res.status(401).json(response);
    }
    
    const decoded = await promisify(jwt.verify)(token, process.env.APP_TOKEN_SECRET);

    // const user = User.findOne({ email: decoded.email }) //if needed we can even send user object from here
    req.user = decoded;
    next();
  } catch (error) {
    res.status(403).json({
      status: "fail",
      error: "Invalid token"
    });
  }
};