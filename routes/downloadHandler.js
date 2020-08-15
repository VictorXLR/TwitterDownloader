const axios = require("axios")
const express = require("express")
const errorHandler = require('../ExceptionHandler')
const helpers = require('../helpers')
const { default: helmet } = require("helmet")
const router = express.Router()

PostOperation = errorHandler.catchAsyncErrors(async (req, res, next) => {
    // skipping the next catch all 
    req.skip = true

    // add to logging for morgan
    req.pathx = "/downlaod"

    if (!req.body.url) return next(600)

    const url = req.body.url

    // check if url is valid or escapes out
    if (!helpers.isUrl(url)) return next(601)

    if (!helpers.isTwitterURL(url)) return next(602)

    let tweetPath = helpers.getTweetPath(url)

    let requestURL = helpers.requestURL(tweetPath)
    
    let data

    try {
        data = await axios({
            method: 'get',
            url: requestURL,
            headers: {
                authorization: process.env.TOKEN
            }
        })
    } catch (error) {
        return next(603)
    }
    log(data)

})


router.post("/", PostOperation)


module.exports = router
