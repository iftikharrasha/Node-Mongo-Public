const errHandler = (err, req, res, next) => {
    console.log(err.message)
}

module.exports = errHandler;