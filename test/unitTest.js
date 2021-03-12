var chai = require('chai')
var chaihttp = require("chai-http")
var assert = require("assert")

let server = require("../server")

chai.use(chaihttp)

describe('Array', function () {
    describe("#indexOf()", function () {
        it("should return -1 when the value is not present", function () {
            assert.strictEqual([1, 2, 3].indexOf(4), -1);
        })
    })
})