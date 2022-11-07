module.exports = (function() {
var __MODS__ = {};
var __DEFINE__ = function(modId, func, req) { var m = { exports: {}, _tempexports: {} }; __MODS__[modId] = { status: 0, func: func, req: req, m: m }; };
var __REQUIRE__ = function(modId, source) { if(!__MODS__[modId]) return require(source); if(!__MODS__[modId].status) { var m = __MODS__[modId].m; m._exports = m._tempexports; var desp = Object.getOwnPropertyDescriptor(m, "exports"); if (desp && desp.configurable) Object.defineProperty(m, "exports", { set: function (val) { if(typeof val === "object" && val !== m._exports) { m._exports.__proto__ = val.__proto__; Object.keys(val).forEach(function (k) { m._exports[k] = val[k]; }); } m._tempexports = val }, get: function () { return m._tempexports; } }); __MODS__[modId].status = 1; __MODS__[modId].func(__MODS__[modId].req, m, m.exports); } return __MODS__[modId].m.exports; };
var __REQUIRE_WILDCARD__ = function(obj) { if(obj && obj.__esModule) { return obj; } else { var newObj = {}; if(obj != null) { for(var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) newObj[k] = obj[k]; } } newObj.default = obj; return newObj; } };
var __REQUIRE_DEFAULT__ = function(obj) { return obj && obj.__esModule ? obj.default : obj; };
__DEFINE__(1667821180098, function(require, module, exports) {
/*!
 * TSRPC Miniapp v3.4.8
 * -----------------------------------------
 * Copyright (c) King Wang.
 * MIT License
 * https://github.com/k8w/tsrpc-miniapp
 */


Object.defineProperty(exports, '__esModule', { value: true });

require('k8w-extend-native');
var tslib = require('tslib');
var tsrpcBaseClient = require('tsrpc-base-client');
var tsrpcProto = require('tsrpc-proto');

var HttpProxy = /** @class */ (function () {
    function HttpProxy() {
    }
    HttpProxy.prototype.fetch = function (options) {
        var _a;
        if (!this.miniappObj) {
            return {
                abort: function () { },
                promise: Promise.resolve({
                    isSucc: false,
                    err: new tsrpcProto.TsrpcError('miniappObj is not set, please check if this is miniapp environment.', { type: tsrpcProto.TsrpcError.Type.ClientError })
                })
            };
        }
        var rs;
        var promise = new Promise(function (_rs) {
            rs = _rs;
        });
        var data;
        if (typeof options.data === 'string') {
            data = options.data;
        }
        else {
            var buf = options.data;
            if (buf.byteOffset === 0 && buf.byteLength === buf.buffer.byteLength) {
                data = buf.buffer;
            }
            else {
                data = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
            }
        }
        var reqTask = this.miniappObj.request({
            url: options.url,
            data: data,
            method: options.method,
            header: (_a = options.headers) !== null && _a !== void 0 ? _a : {
                'content-type': 'application/octet-stream'
            },
            dataType: '其他',
            responseType: options.responseType,
            success: function (res) {
                if (res.statusCode === 200 || res.statusCode === 500) {
                    rs({
                        isSucc: true,
                        res: typeof res.data === 'string' ? res.data : new Uint8Array(res.data)
                    });
                }
                else {
                    rs({
                        isSucc: false,
                        err: new tsrpcProto.TsrpcError({
                            message: 'HTTP Error ' + res.statusCode,
                            type: tsrpcProto.TsrpcError.Type.ServerError,
                            httpCode: res.statusCode
                        })
                    });
                }
            },
            fail: function (res) {
                rs({
                    isSucc: false,
                    err: new tsrpcProto.TsrpcError({
                        message: 'Network Error',
                        type: tsrpcProto.TsrpcError.Type.NetworkError,
                        innerErr: res
                    })
                });
            }
        });
        var abort = reqTask.abort.bind(reqTask);
        return {
            promise: promise,
            abort: abort
        };
    };
    return HttpProxy;
}());

/**
 * Client for TSRPC HTTP Server.
 * It uses native http module of NodeJS.
 * @typeParam ServiceType - `ServiceType` from generated `proto.ts`
 */
var HttpClient = /** @class */ (function (_super) {
    tslib.__extends(HttpClient, _super);
    function HttpClient(proto, options) {
        var _this = this;
        var httpProxy = new HttpProxy;
        _this = _super.call(this, proto, httpProxy, tslib.__assign(tslib.__assign({}, defaultHttpClientOptions), options)) || this;
        httpProxy.miniappObj = _this.options.miniappObj;
        return _this;
    }
    return HttpClient;
}(tsrpcBaseClient.BaseHttpClient));
var defaultHttpClientOptions = tslib.__assign(tslib.__assign({}, tsrpcBaseClient.defaultBaseHttpClientOptions), { miniappObj: typeof wx !== 'undefined' ? wx : undefined, customObjectIdClass: String });

var WebSocketProxy = /** @class */ (function () {
    function WebSocketProxy() {
    }
    WebSocketProxy.prototype.connect = function (server, protocols) {
        var _this = this;
        this._ws = this.miniappObj.connectSocket(tslib.__assign(tslib.__assign({}, this.client.options.connectSocketOptions), { url: server, protocols: protocols }));
        this._ws.onOpen(function (header) {
            _this.options.onOpen();
        });
        this._ws.onError(function (res) {
            _this.options.onError(res);
        });
        this._ws.onClose(function (e) {
            _this.options.onClose(e.code, e.reason);
            _this._ws = undefined;
        });
        this._ws.onMessage(function (e) {
            if (typeof e.data === 'string') {
                _this.options.onMessage(e.data);
            }
            else {
                _this.options.onMessage(new Uint8Array(e.data));
            }
        });
    };
    WebSocketProxy.prototype.close = function (code, reason) {
        var _this = this;
        var _a;
        (_a = this._ws) === null || _a === void 0 ? void 0 : _a.close({
            code: code,
            reason: reason,
            fail: function (res) {
                var _a;
                // 重试一次
                console.error('WebSocket closed failed', res);
                (_a = _this._ws) === null || _a === void 0 ? void 0 : _a.close();
            }
        });
        this._ws = undefined;
    };
    WebSocketProxy.prototype.send = function (data) {
        var _this = this;
        var sendData;
        if (typeof data === 'string') {
            sendData = data;
        }
        else {
            var buf = data;
            if (buf.byteOffset === 0 && buf.byteLength === buf.buffer.byteLength) {
                sendData = buf.buffer;
            }
            else {
                sendData = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
            }
        }
        return new Promise(function (rs) {
            _this._ws.send({
                data: sendData,
                success: function () { rs({}); },
                fail: function (res) {
                    rs({
                        err: new tsrpcProto.TsrpcError({
                            message: 'Network Error',
                            type: tsrpcProto.TsrpcError.Type.NetworkError,
                            innerErr: res
                        })
                    });
                }
            });
        });
    };
    return WebSocketProxy;
}());

/**
 * Client for TSRPC WebSocket Server.
 * @typeParam ServiceType - `ServiceType` from generated `proto.ts`
 */
var WsClient = /** @class */ (function (_super) {
    tslib.__extends(WsClient, _super);
    function WsClient(proto, options) {
        var _this = this;
        var wsp = new WebSocketProxy();
        _this = _super.call(this, proto, wsp, tslib.__assign(tslib.__assign({}, defaultWsClientOptions), options)) || this;
        if (!_this.options.miniappObj) {
            throw new Error('options.miniappObj is not set');
        }
        wsp.miniappObj = _this.options.miniappObj;
        wsp.client = _this;
        return _this;
    }
    return WsClient;
}(tsrpcBaseClient.BaseWsClient));
var defaultWsClientOptions = tslib.__assign(tslib.__assign({}, tsrpcBaseClient.defaultBaseWsClientOptions), { miniappObj: typeof wx !== 'undefined' ? wx : undefined, customObjectIdClass: String });
var a;
var b = a;
console.log(b);

exports.HttpClient = HttpClient;
exports.WsClient = WsClient;
Object.keys(tsrpcProto).forEach(function (k) {
    if (k !== 'default' && !exports.hasOwnProperty(k)) Object.defineProperty(exports, k, {
        enumerable: true,
        get: function () { return tsrpcProto[k]; }
    });
});

}, function(modId) {var map = {}; return __REQUIRE__(map[modId], modId); })
return __REQUIRE__(1667821180098);
})()
//miniprogram-npm-outsideDeps=["k8w-extend-native","tslib","tsrpc-base-client","tsrpc-proto"]
//# sourceMappingURL=index.js.map