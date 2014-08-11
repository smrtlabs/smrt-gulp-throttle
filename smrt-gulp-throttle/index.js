/**
 * @license Copyright (c) 2014 smrtlabs
 * For licensing, see LICENSE
 */

"use strict";

var path = require("path"),
    Q = require("q"),
    Rx = require("rx"),
    through = require("through2");

function rxFromStream(stream) {
    return Rx.Observable
        .create(function (observer) {
            function dataHandler(data) {
                observer.onNext(data);
            }

            function errorHandler(err) {
                observer.onError(err);
            }

            function endHandler() {
                observer.onCompleted();
            }

            stream.addListener("data", dataHandler);
            stream.addListener("error", errorHandler);
            stream.addListener("finish", endHandler);

            return function () {
                stream.removeListener("data", dataHandler);
                stream.removeListener("error", errorHandler);
                stream.removeListener("finish", endHandler);
            };
        })
        .publish()
        .refCount();
}

function throttle(otherFactory, options) {
    var before,
        otherStream,
        rxBefore,
        rxOther;

    otherStream = otherFactory(options);
    rxOther = rxFromStream(otherStream);

    before = through.obj(function (chunk, encoding, callback) {
        console.log("PLUGIN SPY1", path.basename(chunk.path));
        this.push(chunk);

        rxOther
            .filter(function (otherChunk) {
                return otherChunk === chunk;
            })
            .subscribe(function (otherChunk) {
                console.log("PLUGIN YEP", path.basename(otherChunk.path));
                callback();
            });
    });

    rxBefore = Rx.Node
        .fromStream(before)
        .flatMap(function (chunk) {
            var deferred = Q.defer();

            console.log("PLUGIN FLATMAP TIMEOUT", path.basename(chunk.path));
            setTimeout(function () {
                console.log("PLUGIN FLATMAP RESOLVE", path.basename(chunk.path));
                deferred.resolve(chunk);
            }, 10);

            return deferred.promise;
        });

    rxOther
        .subscribe(function (chunk) {
            console.log("PLUGIN OTHER", path.basename(chunk.path));
        });

    Rx.Node.writeToStream(rxBefore, otherStream);

    return before;
}

module.exports = function () {
    if (arguments.length === 2) {
        return throttle(arguments[1], arguments[0]);
    }

    return throttle(arguments[0], {
        "limit": 16
    });
};
