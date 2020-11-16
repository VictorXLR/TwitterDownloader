const execa = require("execa")
const express = require("express")
const BinService = require("../BinService")
const router = express.Router()
const exceptionHander = require("../ExceptionHandler")
const helpers = require("../helpers")

getVersion = (req, res) => {
    BinService.get_version()
        .then(result => { res.send(result) })
}

getDirectURL = (req, res) => {
    let vid_link = req.body.link
    console.log(vid_link);
    if (vid_link) {
        BinService.download_url(vid_link)
            .then(result => res.send(result))
    } else {
        res.send({ message: "Invalid data provided" })
    }

}
FormatListOutput = (req, res) => {
    let download_url = req.body.link

    if (download_url) {
        BinService.list_formats(download_url)
            .then(result => res.send(result))
    } else {
        res.send({ message: "Invalid data provided" })
    }

}

DownloadSpecificCode = (req, res) => {
    let download_url = req.body.link
    let vid_code = req.body.code

    if (download_url && vid_code) {
        BinService.direct_url(vid_code, download_url)
            .then(result => res.send(result))
    } else {
        res.send({ message: "Invalid data provided" })
    }

}

router.get("/", getVersion)
router.post("/", getDirectURL)
router.post("/list", FormatListOutput)
router.post("/code", DownloadSpecificCode)


module.exports = router