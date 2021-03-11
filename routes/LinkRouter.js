const axios = require("axios")
const express = require("express")
const router = express.Router()
const execRouter = require("./BinaryRouter")
const exceptionHandler = require("../ExceptionHandler")
const helpers = require("../helpers")

GetOperation = (req, res, next) => {
    next()
}


PostOperation = exceptionHandler.catchAsyncErrors(async (req, res, next) => {
    req.skip = true
    req.pathx = "/link"
    req.success = false

    if (!req.body.url) return next(600)

    let url = req.body.url

    let quality = req.body.quality ? req.body.quality : "medium"

    if (!helpers.isUrl(url)) {
        req.urlx = url
        return next(601)
    } else req.urlx = url

    if (!helpers.isTwitterURL(url)) {
        req.twitterURL = false
        return next(602)
    } else req.twitterURL = true

    let tweetPath = helpers.getTweetPath(url)

    let requestURL = helpers.requestURL(tweetPath)

    let axios_response

    try {
        axios_response = await axios({
            method: "get",
            url: requestURL,
            headers: {
                authorization: process.env.TOKEN
            }
        })
    } catch (error) {
        return next(603)
    }
    response = axios_response.data
    let videoURL = helpers.getVideoURL(response, quality)
    if (videoURL) {
        res.send(videoURL)
        res.success = true
        res.code = 200
    } else {
        req.success = false
        req.code = 404
        return next(604)
    }
    next()
})

router.get("/", GetOperation)
router.post("/", PostOperation)

module.exports = router