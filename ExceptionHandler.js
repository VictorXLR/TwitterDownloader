exports.catchAsyncErrors = def => {
    console.log("Test, executed from catchAsyncExceptions")
    return function (req, res, next) {
        return def(req, res, next).catch(next)
    }
}

exports.productionErrors = (err, req, res, next) => {
    console.log("Exception from program execution");

    switch (err) {
        case 600:
            req.code = "600: no url found"
            res.status(400).send({ error: "no url found" })
            break
        case 601:
            res.code = "601: not a url"
            res.status(400).send({ error: "not a url" })
            break
        case 602:
            req.code = "602: not a supported url"
            req.status(400).send({ error: "not a supported url" })
            break
        case 603:
            req.code = "603: error fetching tweet"
            res.status(424).send({ error: "error fetching tweet" })
            break
        case 604:
            req.code = "604: video not found"
            res.status(404).send({ error: "video not found" })
            break
        case 620:
            req.code = "620: request to an unsupported route"
            res.send({ error: "620: request to an unsupported route" })
            break
        default:
            console.log(`CRITICAL ERROR OCCURRED: ${err}`)
            req.code = "605: Something messed up bad"
            res.status(500).send({ error: "something bad occurred" })
            break
    } next()
}