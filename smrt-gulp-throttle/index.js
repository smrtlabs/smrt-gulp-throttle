/**
 * @license Copyright (c) 2014 smrtlabs
 * For licensing, see LICENSE
 */

"use strict";

var path = require("path"),
    Q = require("q"),
    Rx = require("rx"),
    TransformStream = require("stream").Transform;

function SchedulerStream(streamFeedback) {
    TransformStream.call(this);

    this.streamFeedback = streamFeedback;
}
SchedulerStream.prototype = Object.create(TransformStream.prototype);

SchedulerStream.prototype._transform = function (chunk, encoding, callback) {
    // this.streamFeedback.streamBuffer.add(chunk, encoding);
    this.streamFeedback.bufferChunk(chunk, encoding, callback);
};

function StreamFactory() {
    TransformStream.call(this);
}
StreamFactory.prototype = Object.create(TransformStream.prototype);

function StreamSupervisor(streamFactory, streamFeedback) {
    TransformStream.call(this);

    this.streamFactroy = streamFactroy;
    this.streamFeedback = streamFeedback;
}
StreamSupervisor.prototype = Object.create(TransformStream.prototype);

StreamSupervisor.prototype._transform = function (chunk, encoding, callback) {
    var streamFactory = this.streamFactory,
        streamFeedback = this.streamFeedback;

    this.streamFeedback
        .awaitWindow()
        .then(function () {
            return streamFactory.applyChunk(chunk, encoding, callback);
        })
        .then(function () {
            streamFeedback.resolveChunk(chunk, encoding, callback);
        })
        .fail(function (err) {
            streamFeedback.rejectChunk(chunk, encoding, callback, err);
        });
};

function throttle(streamFactoryMethod, options) {
    var streamBuffer = new StreamBuffer(),
        streamFactory = new StreamFactory(streamFactoryMethod),
        streamFeedback = new StreamFeedback(streamBuffer),
        streamSupervisor = new StreamSupervisor(streamFactory, streamFeedback);

    return new SchedulerStream(streamFeedback).pipe(streamSupervisor);
}

module.exports = function () {
    if (arguments.length === 2) {
        return throttle(arguments[1], arguments[0]);
    }

    return throttle(arguments[0], {
        "limit": 16
    });
};
