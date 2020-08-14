const axios = require("axios")
const express = require("express")
const errorHandler = require('../ExceptionHandler')
const helpers = require('../helpers')
const router = express.Router()

let Downloader = {}

Downloader.post = errorHandler.catchAsyncErrors(async (req, res, next) => {
    // skipping the next catch all 
    req.skip = true

    // add to logging for morgan
    req.pathx = "/downlaod"

    if (!req.body.url) return next(600)

    const url = req.body.url

    // check if url is valid or escapes out
})


router.post("/", Downloader.post)


module.exports = router
