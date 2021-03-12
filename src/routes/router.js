let express = require("express")
let pjson = require("../../package.json")
let router = express.Router()


// Set up global state of the program
router.all("*", (req, res, next) => {
    if (!req.skip) {
        req.twitterURL = false
        req.urlx = `Route: ${req.path}`
        req.quality = null
        req.success = false
        req.code = 620
        return next(620)
    } else next()
})


module.exports = router