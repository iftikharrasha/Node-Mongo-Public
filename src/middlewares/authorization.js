
module.exports = (...roles) => {
  return (req, res, next) => {
    let response = {
        success: true,
        status: 200,
        signed_in: false,
        version: 1,
        data: [],
        error: null
    }

    // Extract the user role(s) from the `typ` claim in the JWT
    const permissions = req.user.typ;
    const isMatch = roles.some(role => permissions.includes(role));

    // Check if the user role is included in the list of roles required by the function
    if(!isMatch){
      response.success = false;
      response.status = 401;
      response.error = {
          code: 400,
          message: "You do not have permission to access this",
          target: "Not logged in"
      }
      return res.status(401).json(response);
    }

    next();
  };
};