// Package imports
const express = require("express")
const morgan = require("morgan")
const helmet = require("helmet")
const cors = require("cors")

// local imports
require("dotenv").config()

let router = require("./src/routes/router")
let urlRouter = require("./src/routes/LinkRouter")
let exceptionHandler = require("./src/ExceptionHandler")

// special variables
const port = process.env.PORT || 3000

// Main
const app = express()

// set up server dependencies
app.use(cors())
app.use(helmet())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// middleware
morgan.token("url", function getURL(req) {
    return (req.body.url) ? req.body.url : "NA"
})

morgan.token("quality", function getQuality(req) {
    if (req.pathx === "/link" && req.method === "POST") {
        return req.body.quality ? req.body.quality : "medium"
    } else
        return "NA"
})

morgan.token("path", function getPath(req) {
    return req.pathx ? req.pathx : req.path
})

app.use(morgan(":method, :path, :response-time ms, :url, :quality quality"))

// TODO: Database stuff
// Im thinking SQLite since its structured information at least for now :)

// Routing Handlers
app.use("/link", urlRouter)
app.all("*", router)

// Error Handling
app.use(exceptionHandler.productionErrors)

app.listen(port, () => console.log(`TwitterDownloader running at port ${port}`))