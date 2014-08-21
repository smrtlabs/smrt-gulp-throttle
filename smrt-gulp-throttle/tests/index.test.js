/**
 * @license Copyright (c) 2014 smrtlabs
 * For licensing, see LICENSE
 */

"use strict";

/* global describe: false, it: false */

var assert = require("chai").assert,
    gulp = require("gulp"),
    path = require("path"),
    throttle = require(path.join(global.paths.root, "/smrt-gulp-throttle")),
    through = require("through2");

describe("smrt-gulp-throttle", function () {
    it("throttles gulp stream", function (done) {
        gulp.src(path.join(global.paths.root, "/smrt-gulp-throttle/fixtures/*.js"))
            .pipe(throttle(function () {
                return through.obj(function (chunk, encoding, callback) {
                    console.log("TEST_NESTED_STREAM", chunk.path);
                    callback(null, chunk);
                });
            }))
            .on("data", function (chunk) {
                console.log("TEST_OUTGOING_DATA", chunk.path);
            })
            .on("finish", done);
    });
});
