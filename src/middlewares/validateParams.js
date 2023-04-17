const { ObjectId } = require("mongodb");

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
    const id = req.params.id;
    if(!ObjectId.isValid(id)){
        response.status = 403;
        response.signed_in = false,
        response.error = {
            code: 403,
            message: "Not a valid parameter",
            target: "Params middleware"
        }
        return res.status(403).send(response);
    }
    
    next();
  } catch (error) {
    res.status(500).json({
      status: "fail",
      error: "Params middleware issue"
    });
  }
};