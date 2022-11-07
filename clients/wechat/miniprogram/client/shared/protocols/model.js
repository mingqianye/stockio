"use strict";
/* eslint-disable @typescript-eslint/no-redeclare */
exports.__esModule = true;
exports.NonNegativeNumber = exports.NonEmptyString = exports.Price = exports.UserId = exports.RoomId = void 0;
var RoomId = function (s) { return NonEmptyString(s); };
exports.RoomId = RoomId;
var UserId = function (s) { return NonEmptyString(s); };
exports.UserId = UserId;
var Price = function (n) { return NonNegativeNumber(n); };
exports.Price = Price;
function NonEmptyString(s) {
    if (!(s.length > 0)) {
        throw new TypeError("".concat(s, " is empty and cannot convert to NonEmptyString"));
    }
    return s;
}
exports.NonEmptyString = NonEmptyString;
function NonNegativeNumber(n) {
    if (!(n >= 0)) {
        throw new TypeError("".concat(n, " is negative and cannot convert to NonNegativeNumber."));
    }
    return n;
}
exports.NonNegativeNumber = NonNegativeNumber;
