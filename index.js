// Package imports
const express = require("express")
const bodyParser = require("body-parser")
const morgan = require("morgan")
const helmet = require("helmet")
const cors = require("cors")

// local imports
require("dotenv").config()
let router = require("./routes/router")
let downloadRouter = require("./routes/downloadHandler")
let urlRouter = require("./routes/urlRouter")
let exceptionHandler = require("./ExceptionHandler")

// special variables
const port = process.env.PORT || 3000

// Main
const app = express()

// set up server dependencies
app.use(cors())
app.use(helmet())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// middleware
morgan.token("url", function getURL(req) {
    return (req.body.url) ? req.body.url : "NA"
})

morgan.token("quality", function getQuality(req) {
    if (req.pathx === "/url" && req.method === "POST") {
        return req.body.quality ? req.body.quality : "medium"
    } else
        return "NA"
})

morgan.token("code", function getCode(req) {
    return req.code.slice(0, 3)
})

morgan.token("path", function getPath(req) {
    return req.pathx ? req.pathx : req.path
})

app.use(morgan(":method, :path, :response-time ms, :url, :quality quality, :code"))

// TODO: Database stuff
// Im thinking SQLite since its structured information at least for now :)

// Routing Handlers
app.use("/download", downloadRouter)
app.use("/url", urlRouter)
app.all("*", router)

// Error Handling
app.use(exceptionHandler.productionErrors)


app.listen(port, () => console.log(`TwitterDownloader running at port ${port}`))