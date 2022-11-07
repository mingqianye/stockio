module.exports = (function() {
var __MODS__ = {};
var __DEFINE__ = function(modId, func, req) { var m = { exports: {}, _tempexports: {} }; __MODS__[modId] = { status: 0, func: func, req: req, m: m }; };
var __REQUIRE__ = function(modId, source) { if(!__MODS__[modId]) return require(source); if(!__MODS__[modId].status) { var m = __MODS__[modId].m; m._exports = m._tempexports; var desp = Object.getOwnPropertyDescriptor(m, "exports"); if (desp && desp.configurable) Object.defineProperty(m, "exports", { set: function (val) { if(typeof val === "object" && val !== m._exports) { m._exports.__proto__ = val.__proto__; Object.keys(val).forEach(function (k) { m._exports[k] = val[k]; }); } m._tempexports = val }, get: function () { return m._tempexports; } }); __MODS__[modId].status = 1; __MODS__[modId].func(__MODS__[modId].req, m, m.exports); } return __MODS__[modId].m.exports; };
var __REQUIRE_WILDCARD__ = function(obj) { if(obj && obj.__esModule) { return obj; } else { var newObj = {}; if(obj != null) { for(var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) newObj[k] = obj[k]; } } newObj.default = obj; return newObj; } };
var __REQUIRE_DEFAULT__ = function(obj) { return obj && obj.__esModule ? obj.default : obj; };
__DEFINE__(1667821180099, function(require, module, exports) {
/*!
 * TSRPC Proto v1.4.3
 * -----------------------------------------
 * Copyright (c) Kingworks Corporation.
 * MIT License
 * https://github.com/k8w/tsrpc-proto
 */


Object.defineProperty(exports, '__esModule', { value: true });

var tsbufferSchema = require('tsbuffer-schema');
var tslib = require('tslib');

var empty = function () { };
function setLogLevel(logger, logLevel) {
    switch (logLevel) {
        case 'none':
            return { debug: empty, log: empty, warn: empty, error: empty };
        case 'error':
            return { debug: empty, log: empty, warn: empty, error: logger.error.bind(logger) };
        case 'warn':
            return { debug: empty, log: empty, warn: logger.warn.bind(logger), error: logger.error.bind(logger) };
        case 'info':
            return { debug: empty, log: logger.log.bind(logger), warn: logger.warn.bind(logger), error: logger.error.bind(logger) };
        case 'debug':
            return logger;
        default:
            throw new Error("Invalid logLevel: '".concat(logLevel, "'"));
    }
}

exports.TsrpcErrorType = void 0;
(function (TsrpcErrorType) {
    /** Network error, like connection broken, network timeout, etc. */
    TsrpcErrorType["NetworkError"] = "NetworkError";
    /**
     * Server exception, for example "request format error", "database exception", etc.
     *
     * @remarks
     * This error message may be not suitable to show to user,
     * but the error info is useful for engineer to find some bug.
     * So you can show a user-friendly message to user (like "System error, please contact XXX"),
     * and report some debug info at the same time.
     */
    TsrpcErrorType["ServerError"] = "ServerError";
    /** Client exception, for example parse server output error.
     * (May because of the proto file is not the same between server and client)
     */
    TsrpcErrorType["ClientError"] = "ClientError";
    /**
     * The business error returned by `call.error`.
     * It is always business-relatived, for example `call.error('Password is incorrect')`, `call.error('Not enough credit')`, etc.
     */
    TsrpcErrorType["ApiError"] = "ApiError";
})(exports.TsrpcErrorType || (exports.TsrpcErrorType = {}));

var TransportDataProto = {
    "ServerInputData": {
        "type": tsbufferSchema.SchemaType.Interface,
        "properties": [
            {
                "id": 0,
                "name": "serviceId",
                "type": {
                    "type": tsbufferSchema.SchemaType.Number,
                    "scalarType": "uint"
                }
            },
            {
                "id": 1,
                "name": "buffer",
                "type": {
                    "type": tsbufferSchema.SchemaType.Buffer,
                    "arrayType": "Uint8Array"
                }
            },
            {
                "id": 2,
                "name": "sn",
                "type": {
                    "type": tsbufferSchema.SchemaType.Number,
                    "scalarType": "uint"
                },
                "optional": true
            }
        ]
    },
    "ServerOutputData": {
        "type": tsbufferSchema.SchemaType.Interface,
        "properties": [
            {
                "id": 0,
                "name": "buffer",
                "type": {
                    "type": tsbufferSchema.SchemaType.Buffer,
                    "arrayType": "Uint8Array"
                },
                "optional": true
            },
            {
                "id": 1,
                "name": "error",
                "type": {
                    "type": tsbufferSchema.SchemaType.Reference,
                    "target": "TsrpcErrorData"
                },
                "optional": true
            },
            {
                "id": 2,
                "name": "serviceId",
                "type": {
                    "type": tsbufferSchema.SchemaType.Number,
                    "scalarType": "uint"
                },
                "optional": true
            },
            {
                "id": 3,
                "name": "sn",
                "type": {
                    "type": tsbufferSchema.SchemaType.Number,
                    "scalarType": "uint"
                },
                "optional": true
            }
        ]
    },
    "TsrpcErrorData": {
        "type": tsbufferSchema.SchemaType.Interface,
        "properties": [
            {
                "id": 0,
                "name": "message",
                "type": {
                    "type": tsbufferSchema.SchemaType.String
                }
            },
            {
                "id": 1,
                "name": "type",
                "type": {
                    "type": tsbufferSchema.SchemaType.Reference,
                    "target": "TsrpcErrorType"
                }
            },
            {
                "id": 2,
                "name": "code",
                "type": {
                    "type": tsbufferSchema.SchemaType.Union,
                    "members": [
                        {
                            "id": 0,
                            "type": {
                                "type": tsbufferSchema.SchemaType.String
                            }
                        },
                        {
                            "id": 1,
                            "type": {
                                "type": tsbufferSchema.SchemaType.Number,
                                "scalarType": "int"
                            }
                        }
                    ]
                },
                "optional": true
            }
        ],
        "indexSignature": {
            "keyType": "String",
            "type": {
                "type": tsbufferSchema.SchemaType.Any
            }
        }
    },
    "TsrpcErrorType": {
        "type": tsbufferSchema.SchemaType.Enum,
        "members": [
            {
                "id": 0,
                "value": "NetworkError"
            },
            {
                "id": 1,
                "value": "ServerError"
            },
            {
                "id": 2,
                "value": "ClientError"
            },
            {
                "id": 3,
                "value": "ApiError"
            }
        ]
    }
};

/**
 * A unified Error that returned by TSRPC server or client
 *
 * @remarks
 * It has many uses, for example:
 *
 * 1. You can handle business errors and network errors uniformly.
 * 2. In API handle process, `throw new TsrpcError('xxx')` would return the same error to client directly (like `call.error()`),
 * while `throw new Error('XXX')` would return a unified "Server Internal Error".
 */
var TsrpcError = /** @class */ (function () {
    function TsrpcError(dataOrMessage, data) {
        var _a;
        if (typeof dataOrMessage === 'string') {
            this.message = dataOrMessage;
            this.type = (_a = data === null || data === void 0 ? void 0 : data.type) !== null && _a !== void 0 ? _a : exports.TsrpcErrorType.ApiError;
            tslib.__assign(this, data);
        }
        else {
            tslib.__assign(this, dataOrMessage);
        }
    }
    TsrpcError.prototype.toString = function () {
        return "[TSRPC ".concat(this.type, "]: ").concat(this.message);
    };
    TsrpcError.Type = exports.TsrpcErrorType;
    return TsrpcError;
}());

exports.TransportDataProto = TransportDataProto;
exports.TsrpcError = TsrpcError;
exports.setLogLevel = setLogLevel;

}, function(modId) {var map = {}; return __REQUIRE__(map[modId], modId); })
return __REQUIRE__(1667821180099);
})()
//miniprogram-npm-outsideDeps=["tsbuffer-schema","tslib"]
//# sourceMappingURL=index.js.map