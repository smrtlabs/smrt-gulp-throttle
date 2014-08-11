/**
 * @license Copyright (c) 2014 smrtlabs
 * For licensing, see LICENSE
 */

"use strict";

/* global describe: false, it: false */

var gulp = require("gulp"),
    mocha = require("gulp-mocha"),
    path = require("path"),
    throttle = require(path.join(global.paths.root, "/smrt-gulp-throttle"));

describe("gulp-mocha", function () {
    it("throttles gulp file stream", function (done) {
        gulp.src(path.join(global.paths.root, "/gulp-mocha/fixtures/*.test.js"))
            .pipe(throttle({
                "limit": 1
            }, function () {
                    return mocha();
                }))
            .on("data", function (chunk) {
                console.log("USER OUTER", path.basename(chunk.path));
            })
            .on("end", done);
    });
});
