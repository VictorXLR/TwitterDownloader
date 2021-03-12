process.env.NODE_ENV = 'test'

var chai = require('chai')
var chaihttp = require("chai-http")
var assert = require("assert")

let server = require("../server")
let should = chai.should()

chai.use(chaihttp)

describe('Array', function () {
    describe("#indexOf()", function () {
        it("should return -1 when the value is not present", function () {
            assert.strictEqual([1, 2, 3].indexOf(4), -1);
        })
    })
})

describe("GET Requests", () => {
    it("Should redirect to Home site", (done) => {
        chai.request(server)
            .get("/hello")
            .end((err, res) => {
                res.should.have.status(200)
                assert.strictEqual(res.redirects[0], 'https://victorxlr.me/')
                done()
            })
    })
})

describe("POST Requests", () => {
    it("It should return a URL of the video directly", (done) => {
        let payload = {
            "quality": "high",
            "url": "https://twitter.com/FreddieGibbs/status/1322028151615021056"
        }
        chai.request(server)
            .post('/link')
            .send(payload)
            .end((err, res) => {
                res.should.have.status(200)
                assert.strictEqual(res.text.includes('twimg'), true)
                // console.log(res.text);
                done()
            })
    });

    it("it should return a json message regarding the error", (done) => {
        let payload = {
            "quality": "high",
            "url": "https://twitter.com/FreddieGibbs/status/13220281516150210"
        }
        chai.request(server)
            .post('/link')
            .send(payload)
            .end((err, res) => {
                res.should.have.status(424)
                res.body.should.have.property("error")
                done()
            })
    })
})