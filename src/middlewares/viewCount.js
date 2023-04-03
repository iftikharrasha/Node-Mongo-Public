//an exmple of application level middleware, which always runs when the app runs

let count = 0;
const viewCount = (req, res, next) => {
    count++;

    // res.send('Counted')
    next()
}

module.exports = viewCount;