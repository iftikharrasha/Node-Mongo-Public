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
    if(!req.query.version){
        response.success = false;
        response.status = 400;
        response.error = {
            code: 400,
            message: "Missing version query parameter",
            target: "Version middleware"
        }
        return res.send(response);
    }
    
    next();
  } catch (error) {
    res.status(403).json({
      status: "fail",
      error: "Version middleware issue"
    });
  }
};