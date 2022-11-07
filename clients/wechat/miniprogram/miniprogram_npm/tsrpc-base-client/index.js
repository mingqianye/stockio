module.exports = (function() {
var __MODS__ = {};
var __DEFINE__ = function(modId, func, req) { var m = { exports: {}, _tempexports: {} }; __MODS__[modId] = { status: 0, func: func, req: req, m: m }; };
var __REQUIRE__ = function(modId, source) { if(!__MODS__[modId]) return require(source); if(!__MODS__[modId].status) { var m = __MODS__[modId].m; m._exports = m._tempexports; var desp = Object.getOwnPropertyDescriptor(m, "exports"); if (desp && desp.configurable) Object.defineProperty(m, "exports", { set: function (val) { if(typeof val === "object" && val !== m._exports) { m._exports.__proto__ = val.__proto__; Object.keys(val).forEach(function (k) { m._exports[k] = val[k]; }); } m._tempexports = val }, get: function () { return m._tempexports; } }); __MODS__[modId].status = 1; __MODS__[modId].func(__MODS__[modId].req, m, m.exports); } return __MODS__[modId].m.exports; };
var __REQUIRE_WILDCARD__ = function(obj) { if(obj && obj.__esModule) { return obj; } else { var newObj = {}; if(obj != null) { for(var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) newObj[k] = obj[k]; } } newObj.default = obj; return newObj; } };
var __REQUIRE_DEFAULT__ = function(obj) { return obj && obj.__esModule ? obj.default : obj; };
__DEFINE__(1667821180097, function(require, module, exports) {
/*!
 * TSRPC Base Client v2.1.10
 * -----------------------------------------
 * Copyright (c) Kingworks Corporation.
 * MIT License
 * https://github.com/k8w/tsrpc-base-client
 */


Object.defineProperty(exports, '__esModule', { value: true });

require('k8w-extend-native');
var tslib = require('tslib');
var tsbuffer = require('tsbuffer');
var tsrpcProto = require('tsrpc-proto');
var tsbufferSchema = require('tsbuffer-schema');

/**
 * An auto-increment counter
 */
var Counter = /** @class */ (function () {
    function Counter(min, max) {
        if (min === void 0) { min = 1; }
        if (max === void 0) { max = Number.MAX_SAFE_INTEGER; }
        this._min = min;
        this._max = max;
        this._last = max;
    }
    /**
     * Reset the counter, makes `getNext()` restart from `0`
     */
    Counter.prototype.reset = function () {
        this._last = this._max;
    };
    /**
     * Get next counter value, and auto increment `1`
     * @param notInc - Just get the next possible value, not actually increasing the sequence
     */
    Counter.prototype.getNext = function (notInc) {
        return this._last >= this._max ? (this._last = this._min) : (notInc ? this._last : ++this._last);
    };
    Object.defineProperty(Counter.prototype, "last", {
        /**
         * Last return of `getNext()`
         */
        get: function () {
            return this._last;
        },
        enumerable: false,
        configurable: true
    });
    return Counter;
}());

/**
 * A `Flow` is consists of many `FlowNode`, which is function with the same input and output (like pipeline).
 *
 * @remarks
 * `Flow` is like a hook or event, executed at a specific time.
 * The difference to event is it can be used to **interrupt** an action, by return `undefined` or `null` in a node.
 */
var Flow = /** @class */ (function () {
    function Flow() {
        /**
         * All node functions, if you want to adjust the sort you can modify this.
         */
        this.nodes = [];
        /**
         * Event when error throwed from a `FlowNode` function.
         * By default, it does nothing except print a `Uncaught FlowError` error log.
         * @param e
         * @param last
         * @param input
         * @param logger
         */
        this.onError = function (e, last, input, logger) {
            logger === null || logger === void 0 ? void 0 : logger.error('Uncaught FlowError:', e);
        };
    }
    /**
     * Execute all node function one by one, the previous output is the next input,
     * until the last output would be return to the caller.
     *
     * @remarks
     * If any node function return `null | undefined`, or throws an error,
     * the latter node functions would not be executed.
     * And it would return `null | undefined` immediately to the caller,
     * which tell the caller it means a interruption,
     * to let the caller stop latter behaviours.
     *
     * @param input The input of the first `FlowNode`
     * @param logger Logger to print log, `undefined` means to hide all log.
     * @returns
     */
    Flow.prototype.exec = function (input, logger) {
        return tslib.__awaiter(this, void 0, void 0, function () {
            var res, i, e_1;
            return tslib.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        res = input;
                        i = 0;
                        _a.label = 1;
                    case 1:
                        if (!(i < this.nodes.length)) return [3 /*break*/, 7];
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, this.nodes[i](res)];
                    case 3:
                        res = _a.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        e_1 = _a.sent();
                        this.onError(e_1, res, input, logger);
                        return [2 /*return*/, undefined];
                    case 5:
                        // Return 非true 表示不继续后续流程 立即中止
                        if (res === null || res === undefined) {
                            return [2 /*return*/, res];
                        }
                        _a.label = 6;
                    case 6:
                        ++i;
                        return [3 /*break*/, 1];
                    case 7: return [2 /*return*/, res];
                }
            });
        });
    };
    /**
     * Append a node function to the last
     * @param node
     * @returns
     */
    Flow.prototype.push = function (node) {
        this.nodes.push(node);
        return node;
    };
    /**
     * Remove a node function
     * @param node
     * @returns
     */
    Flow.prototype.remove = function (node) {
        return this.nodes.remove(function (v) { return v === node; });
    };
    return Flow;
}());

function getCustomObjectIdTypes(classObjectId) {
    var output = {};
    // string
    if (classObjectId === String) {
        output['?mongodb/ObjectId'] = {
            type: tsbufferSchema.SchemaType.Custom,
            validate: function (value) {
                if (typeof value !== 'string') {
                    return { isSucc: false, errMsg: "Expected type to be `string`, actually `".concat(typeof value, "`.") };
                }
                if (!/[0-9a-fA-F]{24}/.test(value)) {
                    return { isSucc: false, errMsg: 'ObjectId must be a string of 24 hex characters' };
                }
                return { isSucc: true };
            },
            encode: function (value) {
                return new Uint8Array(Array.from({ length: 12 }, function (_, i) { return Number.parseInt('0x' + value.substr(i * 2, 2)); }));
            },
            decode: function (buf) {
                return Array.from(buf, function (v) {
                    var str = v.toString(16);
                    if (str.length === 1) {
                        str = '0' + str;
                    }
                    return str;
                }).join('');
            }
        };
    }
    // ObjectId
    else {
        output['?mongodb/ObjectId'] = {
            type: tsbufferSchema.SchemaType.Custom,
            validate: function (value) { return (value instanceof classObjectId) ?
                { isSucc: true } :
                { isSucc: false, errMsg: "Expected to be instance of `ObjectId`, actually not." }; },
            encode: function (value) { return new Uint8Array(value.id); },
            decode: function (buf) { return new classObjectId(buf); },
            decodeJSON: function (json) { return new classObjectId(json); }
        };
    }
    output['?mongodb/ObjectID'] = output['?mongodb/ObjectId'];
    output['?bson/ObjectId'] = output['?mongodb/ObjectId'];
    output['?bson/ObjectID'] = output['?mongodb/ObjectId'];
    return output;
}

/**
 * A manager for TSRPC receiving messages
 */
var MsgHandlerManager = /** @class */ (function () {
    function MsgHandlerManager() {
        this._handlers = {};
    }
    /**
     * Execute all handlers parallelly
     * @returns handlers count
     */
    MsgHandlerManager.prototype.forEachHandler = function (msgName, logger) {
        var args = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            args[_i - 2] = arguments[_i];
        }
        var handlers = this._handlers[msgName];
        if (!handlers) {
            return [];
        }
        var output = [];
        for (var _a = 0, handlers_1 = handlers; _a < handlers_1.length; _a++) {
            var handler = handlers_1[_a];
            try {
                output.push(handler.apply(void 0, args));
            }
            catch (e) {
                logger === null || logger === void 0 ? void 0 : logger.error('[MsgHandlerError]', e);
            }
        }
        return output;
    };
    /**
     * Add message handler, duplicate handlers to the same `msgName` would be ignored.
     * @param msgName
     * @param handler
     * @returns
     */
    MsgHandlerManager.prototype.addHandler = function (msgName, handler) {
        var handlers = this._handlers[msgName];
        // 初始化Handlers
        if (!handlers) {
            handlers = this._handlers[msgName] = [];
        }
        // 防止重复监听
        else if (handlers.some(function (v) { return v === handler; })) {
            return;
        }
        handlers.push(handler);
    };
    /**
     * Remove handler from the specific `msgName`
     * @param msgName
     * @param handler
     * @returns
     */
    MsgHandlerManager.prototype.removeHandler = function (msgName, handler) {
        var handlers = this._handlers[msgName];
        if (!handlers) {
            return;
        }
        handlers.removeOne(function (v) { return v === handler; });
    };
    /**
     * Remove all handlers for the specific `msgName`
     * @param msgName
     */
    MsgHandlerManager.prototype.removeAllHandlers = function (msgName) {
        this._handlers[msgName] = undefined;
    };
    return MsgHandlerManager;
}());

/** A utility for generate `ServiceMap` */
var ServiceMapUtil = /** @class */ (function () {
    function ServiceMapUtil() {
    }
    ServiceMapUtil.getServiceMap = function (proto) {
        var map = {
            id2Service: {},
            apiName2Service: {},
            msgName2Service: {}
        };
        for (var _i = 0, _a = proto.services; _i < _a.length; _i++) {
            var v = _a[_i];
            var match = v.name.match(/(.+\/)?([^\/]+)$/);
            var path = match[1] || '';
            var name_1 = match[2];
            if (v.type === 'api') {
                var svc = tslib.__assign(tslib.__assign({}, v), { reqSchemaId: "".concat(path, "Ptl").concat(name_1, "/Req").concat(name_1), resSchemaId: "".concat(path, "Ptl").concat(name_1, "/Res").concat(name_1) });
                map.apiName2Service[v.name] = svc;
                map.id2Service[v.id] = svc;
            }
            else {
                var svc = tslib.__assign(tslib.__assign({}, v), { msgSchemaId: "".concat(path, "Msg").concat(name_1, "/Msg").concat(name_1) });
                map.msgName2Service[v.name] = svc;
                map.id2Service[v.id] = svc;
            }
        }
        return map;
    };
    return ServiceMapUtil;
}());

var TransportDataUtil = /** @class */ (function () {
    function TransportDataUtil() {
    }
    Object.defineProperty(TransportDataUtil, "tsbuffer", {
        get: function () {
            if (!this._tsbuffer) {
                this._tsbuffer = new tsbuffer.TSBuffer(tsrpcProto.TransportDataProto);
            }
            return this._tsbuffer;
        },
        enumerable: false,
        configurable: true
    });
    TransportDataUtil.encodeClientMsg = function (tsbuffer, service, msg, type, connType) {
        if (type === 'buffer') {
            var op = tsbuffer.encode(msg, service.msgSchemaId);
            if (!op.isSucc) {
                return op;
            }
            var serverInputData = {
                serviceId: service.id,
                buffer: op.buf
            };
            var opOut = this.tsbuffer.encode(serverInputData, 'ServerInputData');
            return opOut.isSucc ? { isSucc: true, output: opOut.buf } : { isSucc: false, errMsg: opOut.errMsg };
        }
        else {
            var op = tsbuffer.encodeJSON(msg, service.msgSchemaId);
            if (!op.isSucc) {
                return op;
            }
            var json = connType === 'SHORT' ? op.json : [service.name, op.json];
            return { isSucc: true, output: type === 'json' ? json : JSON.stringify(json) };
        }
    };
    TransportDataUtil.encodeApiReq = function (tsbuffer, service, req, type, sn) {
        if (type === 'buffer') {
            var op = tsbuffer.encode(req, service.reqSchemaId);
            if (!op.isSucc) {
                return op;
            }
            var serverInputData = {
                serviceId: service.id,
                buffer: op.buf,
                sn: sn
            };
            var opOut = this.tsbuffer.encode(serverInputData, 'ServerInputData');
            return opOut.isSucc ? { isSucc: true, output: opOut.buf } : { isSucc: false, errMsg: opOut.errMsg };
        }
        else {
            var op = tsbuffer.encodeJSON(req, service.reqSchemaId);
            if (!op.isSucc) {
                return op;
            }
            var json = sn === undefined ? op.json : [service.name, op.json, sn];
            return { isSucc: true, output: type === 'json' ? json : JSON.stringify(json) };
        }
    };
    TransportDataUtil.encodeServerMsg = function (tsbuffer, service, msg, type, connType) {
        if (type === 'buffer') {
            var op = tsbuffer.encode(msg, service.msgSchemaId);
            if (!op.isSucc) {
                return op;
            }
            var serverOutputData = {
                serviceId: service.id,
                buffer: op.buf
            };
            var opOut = this.tsbuffer.encode(serverOutputData, 'ServerOutputData');
            return opOut.isSucc ? { isSucc: true, output: opOut.buf } : { isSucc: false, errMsg: opOut.errMsg };
        }
        else {
            var op = tsbuffer.encodeJSON(msg, service.msgSchemaId);
            if (!op.isSucc) {
                return op;
            }
            var json = connType === 'SHORT' ? op.json : [service.name, op.json];
            return { isSucc: true, output: type === 'json' ? json : JSON.stringify(json) };
        }
    };
    TransportDataUtil.parseServerOutout = function (tsbuffer, serviceMap, data, serviceId) {
        if (data instanceof Uint8Array) {
            var opServerOutputData = this.tsbuffer.decode(data, 'ServerOutputData');
            if (!opServerOutputData.isSucc) {
                return opServerOutputData;
            }
            var serverOutputData = opServerOutputData.value;
            serviceId = serviceId !== null && serviceId !== void 0 ? serviceId : serverOutputData.serviceId;
            if (serviceId === undefined) {
                return { isSucc: false, errMsg: "Missing 'serviceId' in ServerOutput" };
            }
            var service = serviceMap.id2Service[serviceId];
            if (!service) {
                return { isSucc: false, errMsg: "Invalid service ID: ".concat(serviceId, " (from ServerOutput)") };
            }
            if (service.type === 'msg') {
                if (!serverOutputData.buffer) {
                    return { isSucc: false, errMsg: 'Empty msg buffer (from ServerOutput)' };
                }
                var opMsg = tsbuffer.decode(serverOutputData.buffer, service.msgSchemaId);
                if (!opMsg.isSucc) {
                    return opMsg;
                }
                return {
                    isSucc: true,
                    result: {
                        type: 'msg',
                        service: service,
                        msg: opMsg.value
                    }
                };
            }
            else {
                if (serverOutputData.error) {
                    return {
                        isSucc: true,
                        result: {
                            type: 'api',
                            service: service,
                            sn: serverOutputData.sn,
                            ret: {
                                isSucc: false,
                                err: new tsrpcProto.TsrpcError(serverOutputData.error)
                            }
                        }
                    };
                }
                else {
                    if (!serverOutputData.buffer) {
                        return { isSucc: false, errMsg: 'Empty API res buffer (from ServerOutput)' };
                    }
                    var opRes = tsbuffer.decode(serverOutputData.buffer, service.resSchemaId);
                    if (!opRes.isSucc) {
                        return opRes;
                    }
                    return {
                        isSucc: true,
                        result: {
                            type: 'api',
                            service: service,
                            sn: serverOutputData.sn,
                            ret: {
                                isSucc: true,
                                res: opRes.value,
                            }
                        }
                    };
                }
            }
        }
        else {
            var json = void 0;
            if (typeof data === 'string') {
                try {
                    json = JSON.parse(data);
                }
                catch (e) {
                    return { isSucc: false, errMsg: "Invalid input JSON: ".concat(e.message) };
                }
            }
            else {
                json = data;
            }
            var body = void 0;
            var sn = void 0;
            var service = void 0;
            if (serviceId == undefined) {
                if (!Array.isArray(json)) {
                    return { isSucc: false, errMsg: "Invalid server output format" };
                }
                var serviceName = json[0];
                body = json[1];
                sn = json[2];
                // 有 SN 是 Api，没 SN 是 Msg
                service = sn ? serviceMap.apiName2Service[serviceName] : serviceMap.msgName2Service[serviceName];
                if (!service) {
                    return { isSucc: false, errMsg: "Invalid service name: ".concat(serviceName, " (from ServerOutputData)") };
                }
            }
            else {
                service = serviceMap.id2Service[serviceId];
                if (!service) {
                    return { isSucc: false, errMsg: "Invalid service ID: ".concat(serviceId) };
                }
                body = json;
            }
            if (service.type === 'api') {
                if (body.isSucc && 'res' in body) {
                    var op = tsbuffer.decodeJSON(body.res, service.resSchemaId);
                    if (!op.isSucc) {
                        return op;
                    }
                    body.res = op.value;
                }
                else if (body.err) {
                    body.err = new tsrpcProto.TsrpcError(body.err);
                }
                else {
                    return { isSucc: false, errMsg: "Invalid server output format" };
                }
                return {
                    isSucc: true,
                    result: {
                        type: 'api',
                        service: service,
                        sn: sn,
                        ret: body
                    }
                };
            }
            else {
                var op = tsbuffer.decodeJSON(body, service.msgSchemaId);
                if (!op.isSucc) {
                    return op;
                }
                return {
                    isSucc: true,
                    result: {
                        type: 'msg',
                        service: service,
                        msg: op.value
                    }
                };
            }
        }
    };
    // 心跳包（Ping & Pong），所有开头为 0 的 Buffer，均为控制指令
    TransportDataUtil.HeartbeatPacket = new Uint8Array([0]);
    return TransportDataUtil;
}());

/**
 * An abstract base class for TSRPC Client,
 * which includes some common buffer process flows.
 *
 * @remarks
 * You can implement a client on a specific transportation protocol (like HTTP, WebSocket, QUIP) by extend this.
 *
 * @typeParam ServiceType - `ServiceType` from generated `proto.ts`
 *
 * @see
 * {@link https://github.com/k8w/tsrpc}
 * {@link https://github.com/k8w/tsrpc-browser}
 * {@link https://github.com/k8w/tsrpc-miniapp}
 */
var BaseClient = /** @class */ (function () {
    function BaseClient(proto, options) {
        this._msgHandlers = new MsgHandlerManager();
        /**
         * {@link Flow} to process `callApi`, `sendMsg`, buffer input/output, etc...
         */
        this.flows = {
            // callApi
            preCallApiFlow: new Flow(),
            preApiReturnFlow: new Flow(),
            postApiReturnFlow: new Flow(),
            // sendMsg
            preSendMsgFlow: new Flow(),
            postSendMsgFlow: new Flow(),
            preRecvMsgFlow: new Flow(),
            postRecvMsgFlow: new Flow(),
            // buffer
            preSendDataFlow: new Flow(),
            preRecvDataFlow: new Flow(),
            /**
             * @deprecated Please use `preSendDataFlow` instead
             */
            preSendBufferFlow: new Flow(),
            /**
             * @deprecated Please use `preRecvDataFlow` instead
             */
            preRecvBufferFlow: new Flow(),
            // Connection Flows (Only for WebSocket)
            /** Before connect to WebSocket server */
            preConnectFlow: new Flow(),
            /** After WebSocket connect successfully */
            postConnectFlow: new Flow(),
            /** After WebSocket disconnected (from connected status) */
            postDisconnectFlow: new Flow(),
        };
        this._apiSnCounter = new Counter(1);
        /**
         * Pending API Requests
         */
        this._pendingApis = [];
        /** @deprecated Please use `_onRecvData` instead */
        this._onRecvBuf = this._onRecvData;
        this.options = options;
        this.serviceMap = ServiceMapUtil.getServiceMap(proto);
        this.dataType = this.options.json ? 'text' : 'buffer';
        var types = tslib.__assign({}, proto.types);
        // Custom ObjectId handler
        if (options.customObjectIdClass) {
            types = tslib.__assign(tslib.__assign({}, types), getCustomObjectIdTypes(options.customObjectIdClass));
        }
        this.tsbuffer = new tsbuffer.TSBuffer(types);
        this.logger = this.options.logger;
        if (this.logger) {
            this.logger = tsrpcProto.setLogLevel(this.logger, this.options.logLevel);
        }
    }
    Object.defineProperty(BaseClient.prototype, "lastSN", {
        /**
         * The `SN` number of the last `callApi()`,
         * which can be passed to `abort()` to abort an API request.
         * @example
         * ```ts
         * client.callApi('xxx', { value: 'xxx' })
         *   .then(ret=>{ console.log('succ', ret) });
         * let lastSN = client.lastSN;
         * client.abort(lastSN);
         * ```
         */
        get: function () {
            return this._apiSnCounter.last;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(BaseClient.prototype, "nextSN", {
        /**
         * The `SN` number of the next `callApi()`,
         * which can be passed to `abort()` to abort an API request.
         * @example
         * ```ts
         * let nextSN = client.nextSN;
         * client.callApi('xxx', { value: 'xxx' })
         * ```
         */
        get: function () {
            return this._apiSnCounter.getNext(true);
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Send request and wait for the return
     * @param apiName
     * @param req - Request body
     * @param options - Transport options
     * @returns return a `ApiReturn`, all error (network error, business error, code exception...) is unified as `TsrpcError`.
     * The promise is never rejected, so you just need to process all error in one place.
     */
    BaseClient.prototype.callApi = function (apiName, req, options) {
        if (options === void 0) { options = {}; }
        return tslib.__awaiter(this, void 0, void 0, function () {
            var sn, pendingItem, promise;
            var _this = this;
            return tslib.__generator(this, function (_a) {
                sn = this._apiSnCounter.getNext();
                pendingItem = {
                    sn: sn,
                    abortKey: options.abortKey,
                    service: this.serviceMap.apiName2Service[apiName]
                };
                this._pendingApis.push(pendingItem);
                promise = new Promise(function (rs) { return tslib.__awaiter(_this, void 0, void 0, function () {
                    var pre, ret, preReturn;
                    var _a, _b;
                    return tslib.__generator(this, function (_c) {
                        switch (_c.label) {
                            case 0: return [4 /*yield*/, this.flows.preCallApiFlow.exec({
                                    apiName: apiName,
                                    req: req,
                                    options: options
                                }, this.logger)];
                            case 1:
                                pre = _c.sent();
                                if (!pre || pendingItem.isAborted) {
                                    this.abort(pendingItem.sn);
                                    return [2 /*return*/];
                                }
                                if (!pre.return) return [3 /*break*/, 2];
                                ret = pre.return;
                                return [3 /*break*/, 4];
                            case 2: return [4 /*yield*/, this._doCallApi(pre.apiName, pre.req, pre.options, pendingItem)];
                            case 3:
                                // do call means it will send buffer via network
                                ret = _c.sent();
                                _c.label = 4;
                            case 4:
                                if (pendingItem.isAborted) {
                                    return [2 /*return*/];
                                }
                                // Log Original Return
                                if (ret.isSucc) {
                                    this.options.logApi && ((_a = this.logger) === null || _a === void 0 ? void 0 : _a.log("[ApiRes] #".concat(pendingItem.sn, " ").concat(apiName), ret.res));
                                }
                                else {
                                    this.options.logApi && ((_b = this.logger) === null || _b === void 0 ? void 0 : _b[ret.err.type === tsrpcProto.TsrpcError.Type.ApiError ? 'log' : 'error']("[ApiErr] #".concat(pendingItem.sn, " ").concat(apiName), ret.err));
                                }
                                return [4 /*yield*/, this.flows.preApiReturnFlow.exec(tslib.__assign(tslib.__assign({}, pre), { return: ret }), this.logger)];
                            case 5:
                                preReturn = _c.sent();
                                if (!preReturn) {
                                    this.abort(pendingItem.sn);
                                    return [2 /*return*/];
                                }
                                rs(preReturn.return);
                                // Post Flow
                                this.flows.postApiReturnFlow.exec(preReturn, this.logger);
                                return [2 /*return*/];
                        }
                    });
                }); });
                // Finally clear pendings
                promise.catch().then(function () {
                    _this._pendingApis.removeOne(function (v) { return v.sn === pendingItem.sn; });
                });
                return [2 /*return*/, promise];
            });
        });
    };
    BaseClient.prototype._doCallApi = function (apiName, req, options, pendingItem) {
        var _a;
        if (options === void 0) { options = {}; }
        return tslib.__awaiter(this, void 0, void 0, function () {
            var promise;
            var _this = this;
            return tslib.__generator(this, function (_b) {
                this.options.logApi && ((_a = this.logger) === null || _a === void 0 ? void 0 : _a.log("[ApiReq] #".concat(pendingItem.sn), apiName, req));
                promise = new Promise(function (rs) { return tslib.__awaiter(_this, void 0, void 0, function () {
                    var service, opEncode, promiseReturn, promiseSend, opSend, ret;
                    var _a;
                    return tslib.__generator(this, function (_b) {
                        switch (_b.label) {
                            case 0:
                                service = this.serviceMap.apiName2Service[apiName];
                                if (!service) {
                                    rs({
                                        isSucc: false,
                                        err: new tsrpcProto.TsrpcError('Invalid api name: ' + apiName, {
                                            code: 'INVALID_API_NAME',
                                            type: tsrpcProto.TsrpcErrorType.ClientError
                                        })
                                    });
                                    return [2 /*return*/];
                                }
                                pendingItem.service = service;
                                opEncode = TransportDataUtil.encodeApiReq(this.tsbuffer, service, req, this.dataType, this.type === 'LONG' ? pendingItem.sn : undefined);
                                if (!opEncode.isSucc) {
                                    rs({
                                        isSucc: false, err: new tsrpcProto.TsrpcError(opEncode.errMsg, {
                                            type: tsrpcProto.TsrpcErrorType.ClientError,
                                            code: 'INPUT_DATA_ERR'
                                        })
                                    });
                                    return [2 /*return*/];
                                }
                                promiseReturn = this._waitApiReturn(pendingItem, (_a = options.timeout) !== null && _a !== void 0 ? _a : this.options.timeout);
                                promiseSend = this.sendData(opEncode.output, options, service.id, pendingItem);
                                return [4 /*yield*/, promiseSend];
                            case 1:
                                opSend = _b.sent();
                                if (opSend.err) {
                                    rs({
                                        isSucc: false,
                                        err: opSend.err
                                    });
                                    return [2 /*return*/];
                                }
                                return [4 /*yield*/, promiseReturn];
                            case 2:
                                ret = _b.sent();
                                if (pendingItem.isAborted) {
                                    return [2 /*return*/];
                                }
                                rs(ret);
                                return [2 /*return*/];
                        }
                    });
                }); });
                return [2 /*return*/, promise];
            });
        });
    };
    /**
     * Send message, without response, not ensuring the server is received and processed correctly.
     * @param msgName
     * @param msg - Message body
     * @param options - Transport options
     * @returns If the promise is resolved, it means the request is sent to system kernel successfully.
     * Notice that not means the server received and processed the message correctly.
     */
    BaseClient.prototype.sendMsg = function (msgName, msg, options) {
        var _this = this;
        if (options === void 0) { options = {}; }
        var promise = new Promise(function (rs) { return tslib.__awaiter(_this, void 0, void 0, function () {
            var pre, service, opEncode, promiseSend, opSend;
            var _a, _b;
            return tslib.__generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, this.flows.preSendMsgFlow.exec({
                            msgName: msgName,
                            msg: msg,
                            options: options
                        }, this.logger)];
                    case 1:
                        pre = _c.sent();
                        if (!pre) {
                            return [2 /*return*/];
                        }
                        // The msg is not prevented by pre flow
                        this.options.logMsg && ((_a = this.logger) === null || _a === void 0 ? void 0 : _a.log("[SendMsg]", msgName, msg));
                        service = this.serviceMap.msgName2Service[msgName];
                        if (!service) {
                            (_b = this.logger) === null || _b === void 0 ? void 0 : _b.error('Invalid msg name: ' + msgName);
                            rs({
                                isSucc: false,
                                err: new tsrpcProto.TsrpcError('Invalid msg name: ' + msgName, {
                                    code: 'INVALID_MSG_NAME',
                                    type: tsrpcProto.TsrpcErrorType.ClientError
                                })
                            });
                            return [2 /*return*/];
                        }
                        opEncode = TransportDataUtil.encodeClientMsg(this.tsbuffer, service, msg, this.dataType, this.type);
                        if (!opEncode.isSucc) {
                            rs({
                                isSucc: false,
                                err: new tsrpcProto.TsrpcError(opEncode.errMsg, {
                                    type: tsrpcProto.TsrpcErrorType.ClientError,
                                    code: 'ENCODE_MSG_ERR'
                                })
                            });
                            return [2 /*return*/];
                        }
                        promiseSend = this.sendData(opEncode.output, options, service.id);
                        return [4 /*yield*/, promiseSend];
                    case 2:
                        opSend = _c.sent();
                        if (opSend.err) {
                            rs({
                                isSucc: false,
                                err: opSend.err
                            });
                            return [2 /*return*/];
                        }
                        rs({ isSucc: true });
                        // Post Flow
                        this.flows.postSendMsgFlow.exec(pre, this.logger);
                        return [2 /*return*/];
                }
            });
        }); });
        promise.then(function (v) {
            var _a;
            if (!v.isSucc) {
                ((_a = _this.logger) !== null && _a !== void 0 ? _a : console).error('[SendMsgErr]', v.err);
            }
        });
        return promise;
    };
    /**
     * Add a message handler,
     * duplicate handlers to the same `msgName` would be ignored.
     * @param msgName
     * @param handler
     * @returns
     */
    // listenMsg<T extends keyof ServiceType['msg']>(msgName: T, handler: ClientMsgHandler<ServiceType, T, this>): ClientMsgHandler<ServiceType, T, this>;
    // listenMsg(msgName: RegExp, handler: ClientMsgHandler<ServiceType, keyof ServiceType['msg'], this>): ClientMsgHandler<ServiceType, keyof ServiceType['msg'], this>;
    // listenMsg(msgName: string | RegExp, handler: ClientMsgHandler<ServiceType, string, this>): ClientMsgHandler<ServiceType, string, this> {
    BaseClient.prototype.listenMsg = function (msgName, handler) {
        var _this = this;
        if (msgName instanceof RegExp) {
            Object.keys(this.serviceMap.msgName2Service).filter(function (k) { return msgName.test(k); }).forEach(function (k) {
                _this._msgHandlers.addHandler(k, handler);
            });
        }
        else {
            this._msgHandlers.addHandler(msgName, handler);
        }
        return handler;
    };
    /**
     * Remove a message handler
     */
    BaseClient.prototype.unlistenMsg = function (msgName, handler) {
        var _this = this;
        if (msgName instanceof RegExp) {
            Object.keys(this.serviceMap.msgName2Service).filter(function (k) { return msgName.test(k); }).forEach(function (k) {
                _this._msgHandlers.removeHandler(k, handler);
            });
        }
        else {
            this._msgHandlers.removeHandler(msgName, handler);
        }
    };
    /**
     * Remove all handlers from a message
     */
    BaseClient.prototype.unlistenMsgAll = function (msgName) {
        var _this = this;
        if (msgName instanceof RegExp) {
            Object.keys(this.serviceMap.msgName2Service).filter(function (k) { return msgName.test(k); }).forEach(function (k) {
                _this._msgHandlers.removeAllHandlers(k);
            });
        }
        else {
            this._msgHandlers.removeAllHandlers(msgName);
        }
    };
    /**
     * Abort a pending API request, it makes the promise returned by `callApi()` neither resolved nor rejected forever.
     * @param sn - Every api request has a unique `sn` number, you can get it by `this.lastSN`
     */
    BaseClient.prototype.abort = function (sn) {
        var _a, _b;
        // Find
        var index = this._pendingApis.findIndex(function (v) { return v.sn === sn; });
        if (index === -1) {
            return;
        }
        var pendingItem = this._pendingApis[index];
        // Clear
        this._pendingApis.splice(index, 1);
        pendingItem.onReturn = undefined;
        pendingItem.isAborted = true;
        // Log
        (_a = this.logger) === null || _a === void 0 ? void 0 : _a.log("[ApiAbort] #".concat(pendingItem.sn, " ").concat(pendingItem.service.name));
        // onAbort
        (_b = pendingItem.onAbort) === null || _b === void 0 ? void 0 : _b.call(pendingItem);
    };
    /**
     * Abort all API requests that has the `abortKey`.
     * It makes the promise returned by `callApi` neither resolved nor rejected forever.
     * @param abortKey - The `abortKey` of options when `callApi()`, see {@link TransportOptions.abortKey}.
     * @example
     * ```ts
     * // Send API request many times
     * client.callApi('SendData', { data: 'AAA' }, { abortKey: 'Session#123' });
     * client.callApi('SendData', { data: 'BBB' }, { abortKey: 'Session#123' });
     * client.callApi('SendData', { data: 'CCC' }, { abortKey: 'Session#123' });
     *
     * // And abort the at once
     * client.abortByKey('Session#123');
     * ```
     */
    BaseClient.prototype.abortByKey = function (abortKey) {
        var _this = this;
        this._pendingApis.filter(function (v) { return v.abortKey === abortKey; }).forEach(function (v) { _this.abort(v.sn); });
    };
    /**
     * Abort all pending API requests.
     * It makes the promise returned by `callApi` neither resolved nor rejected forever.
     */
    BaseClient.prototype.abortAll = function () {
        var _this = this;
        this._pendingApis.slice().forEach(function (v) { return _this.abort(v.sn); });
    };
    /**
     * Send data (binary or text)
     * @remarks
     * Long connection: wait res by listenning `conn.onmessage`
     * Short connection: wait res by waitting response
     * @param data
     * @param options
     * @param sn
     */
    BaseClient.prototype.sendData = function (data, options, serviceId, pendingApiItem) {
        var _a, _b, _c;
        return tslib.__awaiter(this, void 0, void 0, function () {
            var pre, preBuf;
            return tslib.__generator(this, function (_d) {
                switch (_d.label) {
                    case 0: return [4 /*yield*/, this.flows.preSendDataFlow.exec({ data: data, sn: pendingApiItem === null || pendingApiItem === void 0 ? void 0 : pendingApiItem.sn }, this.logger)];
                    case 1:
                        pre = _d.sent();
                        if (!pre) {
                            return [2 /*return*/, new Promise(function (rs) { })];
                        }
                        data = pre.data;
                        if (!(data instanceof Uint8Array)) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.flows.preSendBufferFlow.exec({ buf: data, sn: pendingApiItem === null || pendingApiItem === void 0 ? void 0 : pendingApiItem.sn }, this.logger)];
                    case 2:
                        preBuf = _d.sent();
                        if (!preBuf) {
                            return [2 /*return*/, new Promise(function (rs) { })];
                        }
                        data = preBuf.buf;
                        _d.label = 3;
                    case 3:
                        // debugBuf log
                        if (this.options.debugBuf) {
                            if (typeof data === 'string') {
                                (_a = this.logger) === null || _a === void 0 ? void 0 : _a.debug('[SendText]' + (pendingApiItem ? (' #' + pendingApiItem.sn) : '') + " length=".concat(data.length), data);
                            }
                            else if (data instanceof Uint8Array) {
                                (_b = this.logger) === null || _b === void 0 ? void 0 : _b.debug('[SendBuf]' + (pendingApiItem ? (' #' + pendingApiItem.sn) : '') + " length=".concat(data.length), data);
                            }
                            else {
                                (_c = this.logger) === null || _c === void 0 ? void 0 : _c.debug('[SendJSON]' + (pendingApiItem ? (' #' + pendingApiItem.sn) : ''), data);
                            }
                        }
                        return [2 /*return*/, this._sendData(data, options, serviceId, pendingApiItem)];
                }
            });
        });
    };
    // 信道可传输二进制或字符串
    BaseClient.prototype._onRecvData = function (data, pendingApiItem) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
        return tslib.__awaiter(this, void 0, void 0, function () {
            var sn, pre, pre_1, opParsed, parsed, pre_2;
            return tslib.__generator(this, function (_k) {
                switch (_k.label) {
                    case 0:
                        sn = pendingApiItem === null || pendingApiItem === void 0 ? void 0 : pendingApiItem.sn;
                        return [4 /*yield*/, this.flows.preRecvDataFlow.exec({ data: data, sn: sn }, this.logger)];
                    case 1:
                        pre = _k.sent();
                        if (!pre) {
                            return [2 /*return*/];
                        }
                        data = pre.data;
                        if (!(typeof data === 'string')) return [3 /*break*/, 2];
                        this.options.debugBuf && ((_a = this.logger) === null || _a === void 0 ? void 0 : _a.debug('[RecvText]' + (sn ? (' #' + sn) : ''), data));
                        return [3 /*break*/, 5];
                    case 2:
                        if (!(data instanceof Uint8Array)) return [3 /*break*/, 4];
                        this.options.debugBuf && ((_b = this.logger) === null || _b === void 0 ? void 0 : _b.debug('[RecvBuf]' + (sn ? (' #' + sn) : ''), 'length=' + data.length, data));
                        return [4 /*yield*/, this.flows.preRecvBufferFlow.exec({ buf: data, sn: sn }, this.logger)];
                    case 3:
                        pre_1 = _k.sent();
                        if (!pre_1) {
                            return [2 /*return*/];
                        }
                        data = pre_1.buf;
                        return [3 /*break*/, 5];
                    case 4:
                        this.options.debugBuf && ((_c = this.logger) === null || _c === void 0 ? void 0 : _c.debug('[RecvJSON]' + (sn ? (' #' + sn) : ''), data));
                        _k.label = 5;
                    case 5:
                        opParsed = TransportDataUtil.parseServerOutout(this.tsbuffer, this.serviceMap, data, pendingApiItem === null || pendingApiItem === void 0 ? void 0 : pendingApiItem.service.id);
                        if (!opParsed.isSucc) {
                            (_d = this.logger) === null || _d === void 0 ? void 0 : _d.error('ParseServerOutputError: ' + opParsed.errMsg);
                            if (data instanceof Uint8Array) {
                                (_e = this.logger) === null || _e === void 0 ? void 0 : _e.error('Please check the version of serviceProto between server and client');
                            }
                            if (pendingApiItem) {
                                (_f = pendingApiItem.onReturn) === null || _f === void 0 ? void 0 : _f.call(pendingApiItem, {
                                    isSucc: false,
                                    err: new tsrpcProto.TsrpcError('Parse server output error', { type: tsrpcProto.TsrpcErrorType.ServerError })
                                });
                            }
                            return [2 /*return*/];
                        }
                        parsed = opParsed.result;
                        if (!(parsed.type === 'api')) return [3 /*break*/, 6];
                        sn = sn !== null && sn !== void 0 ? sn : parsed.sn;
                        // call ApiReturn listeners
                        (_h = (_g = this._pendingApis.find(function (v) { return v.sn === sn; })) === null || _g === void 0 ? void 0 : _g.onReturn) === null || _h === void 0 ? void 0 : _h.call(_g, parsed.ret);
                        return [3 /*break*/, 9];
                    case 6:
                        if (!(parsed.type === 'msg')) return [3 /*break*/, 9];
                        this.options.logMsg && ((_j = this.logger) === null || _j === void 0 ? void 0 : _j.log("[RecvMsg] ".concat(parsed.service.name), parsed.msg));
                        return [4 /*yield*/, this.flows.preRecvMsgFlow.exec({ msgName: parsed.service.name, msg: parsed.msg }, this.logger)];
                    case 7:
                        pre_2 = _k.sent();
                        if (!pre_2) {
                            return [2 /*return*/];
                        }
                        this._msgHandlers.forEachHandler(pre_2.msgName, this.logger, pre_2.msg, pre_2.msgName);
                        // Post Flow
                        return [4 /*yield*/, this.flows.postRecvMsgFlow.exec(pre_2, this.logger)];
                    case 8:
                        // Post Flow
                        _k.sent();
                        _k.label = 9;
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * @param sn
     * @param timeout
     * @returns `undefined` 代表 canceled
     */
    BaseClient.prototype._waitApiReturn = function (pendingItem, timeout) {
        return tslib.__awaiter(this, void 0, void 0, function () {
            var _this = this;
            return tslib.__generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (rs) {
                        // Timeout
                        var timer;
                        if (timeout) {
                            timer = setTimeout(function () {
                                timer = undefined;
                                _this._pendingApis.removeOne(function (v) { return v.sn === pendingItem.sn; });
                                rs({
                                    isSucc: false,
                                    err: new tsrpcProto.TsrpcError('Request Timeout', {
                                        type: tsrpcProto.TsrpcErrorType.NetworkError,
                                        code: 'TIMEOUT'
                                    })
                                });
                            }, timeout);
                        }
                        // Listener (trigger by `this._onRecvBuf`)
                        pendingItem.onReturn = function (ret) {
                            if (timer) {
                                clearTimeout(timer);
                                timer = undefined;
                            }
                            _this._pendingApis.removeOne(function (v) { return v.sn === pendingItem.sn; });
                            rs(ret);
                        };
                    })];
            });
        });
    };
    return BaseClient;
}());
var defaultBaseClientOptions = {
    logLevel: 'debug',
    logApi: true,
    logMsg: true,
    json: false,
    timeout: 15000,
    debugBuf: false
};

/**
 * Base HTTP Client
 */
var BaseHttpClient = /** @class */ (function (_super) {
    tslib.__extends(BaseHttpClient, _super);
    function BaseHttpClient(proto, http, options) {
        var _this = this;
        var _a;
        _this = _super.call(this, proto, tslib.__assign(tslib.__assign({}, defaultBaseHttpClientOptions), options)) || this;
        _this.type = 'SHORT';
        _this._http = http;
        _this._jsonServer = _this.options.server + (_this.options.server.endsWith('/') ? '' : '/');
        (_a = _this.logger) === null || _a === void 0 ? void 0 : _a.log('TSRPC HTTP Client :', _this.options.server);
        return _this;
    }
    BaseHttpClient.prototype._sendData = function (data, options, serviceId, pendingApiItem) {
        return tslib.__awaiter(this, void 0, void 0, function () {
            var promise;
            var _this = this;
            return tslib.__generator(this, function (_a) {
                promise = (function () { return tslib.__awaiter(_this, void 0, void 0, function () {
                    var service, urlSearch, url, _a, fetchPromise, abort, fetchRes;
                    return tslib.__generator(this, function (_b) {
                        switch (_b.label) {
                            case 0:
                                service = this.serviceMap.id2Service[serviceId];
                                urlSearch = service.type === 'msg' ? '?type=msg' : '';
                                url = typeof data === 'string' ? (this._jsonServer + service.name + urlSearch) : this.options.server;
                                _a = this._http.fetch({
                                    url: url,
                                    data: data,
                                    method: 'POST',
                                    timeout: options.timeout || this.options.timeout,
                                    headers: { 'Content-Type': typeof data === 'string' ? 'application/json' : 'application/octet-stream' },
                                    transportOptions: options,
                                    responseType: typeof data === 'string' ? 'text' : 'arraybuffer',
                                }), fetchPromise = _a.promise, abort = _a.abort;
                                if (pendingApiItem) {
                                    pendingApiItem.onAbort = function () {
                                        abort();
                                    };
                                }
                                // Aborted
                                if (pendingApiItem === null || pendingApiItem === void 0 ? void 0 : pendingApiItem.isAborted) {
                                    return [2 /*return*/, new Promise(function (rs) { })];
                                }
                                return [4 /*yield*/, fetchPromise];
                            case 1:
                                fetchRes = _b.sent();
                                if (!fetchRes.isSucc) {
                                    return [2 /*return*/, { err: fetchRes.err }];
                                }
                                return [2 /*return*/, { res: fetchRes.res }];
                        }
                    });
                }); })();
                promise.then(function (v) {
                    // Msg 不需要 onRecvData
                    if (pendingApiItem && v.res) {
                        _this._onRecvData(v.res, pendingApiItem);
                    }
                });
                // Finally
                promise.catch(function (e) { }).then(function () {
                    if (pendingApiItem) {
                        pendingApiItem.onAbort = undefined;
                    }
                });
                return [2 /*return*/, promise];
            });
        });
    };
    return BaseHttpClient;
}(BaseClient));
var defaultBaseHttpClientOptions = tslib.__assign(tslib.__assign({}, defaultBaseClientOptions), { server: 'http://localhost:3000', 
    // logger: new TerminalColorLogger(),
    jsonPrune: true });

/**
 * WebSocket Client for TSRPC.
 * It uses native `WebSocket` of browser.
 * @typeParam ServiceType - `ServiceType` from generated `proto.ts`
 */
var BaseWsClient = /** @class */ (function (_super) {
    tslib.__extends(BaseWsClient, _super);
    function BaseWsClient(proto, wsp, options) {
        var _this = this;
        var _a;
        _this = _super.call(this, proto, tslib.__assign(tslib.__assign({}, defaultBaseWsClientOptions), options)) || this;
        _this.type = 'LONG';
        _this._onWsOpen = function () {
            var _a;
            if (!_this._connecting) {
                return;
            }
            _this._status = exports.WsClientStatus.Opened;
            _this._connecting.rs({ isSucc: true });
            _this._connecting = undefined;
            (_a = _this.logger) === null || _a === void 0 ? void 0 : _a.log('WebSocket connection to server successful');
            _this.flows.postConnectFlow.exec({}, _this.logger);
            // First heartbeat
            if (_this.options.heartbeat) {
                _this._heartbeat();
            }
        };
        _this._onWsClose = function (code, reason) {
            var _a, _b, _c;
            // 防止重复执行
            if (_this._status === exports.WsClientStatus.Closed) {
                return;
            }
            var isManual = !!_this._rsDisconnecting;
            var isConnectedBefore = _this.isConnected || isManual;
            _this._status = exports.WsClientStatus.Closed;
            // 连接中，返回连接失败
            if (_this._connecting) {
                _this._connecting.rs({
                    isSucc: false,
                    errMsg: "Failed to connect to WebSocket server: ".concat(_this.options.server)
                });
                _this._connecting = undefined;
                (_a = _this.logger) === null || _a === void 0 ? void 0 : _a.error("Failed to connect to WebSocket server: ".concat(_this.options.server));
            }
            // Clear heartbeat
            if (_this._pendingHeartbeat) {
                clearTimeout(_this._pendingHeartbeat.timeoutTimer);
                _this._pendingHeartbeat = undefined;
            }
            if (_this._nextHeartbeatTimer) {
                clearTimeout(_this._nextHeartbeatTimer);
            }
            // disconnect中，返回成功
            if (_this._rsDisconnecting) {
                _this._rsDisconnecting();
                _this._rsDisconnecting = undefined;
                (_b = _this.logger) === null || _b === void 0 ? void 0 : _b.log('Disconnected succ', "code=".concat(code, " reason=").concat(reason));
            }
            // 非 disconnect 中，从连接中意外断开
            else if (isConnectedBefore) {
                (_c = _this.logger) === null || _c === void 0 ? void 0 : _c.log("Lost connection to ".concat(_this.options.server), "code=".concat(code, " reason=").concat(reason));
            }
            // postDisconnectFlow，仅从连接状态断开时触发
            if (isConnectedBefore) {
                _this.flows.postDisconnectFlow.exec({
                    reason: reason,
                    isManual: isManual
                }, _this.logger);
            }
            // 对所有请求中的 API 报错
            _this._pendingApis.slice().forEach(function (v) {
                var _a;
                (_a = v.onReturn) === null || _a === void 0 ? void 0 : _a.call(v, {
                    isSucc: false,
                    err: new tsrpcProto.TsrpcError(reason || 'Lost connection to server', { type: tsrpcProto.TsrpcErrorType.NetworkError, code: 'LOST_CONN' })
                });
            });
        };
        _this._onWsError = function (e) {
            var _a, _b;
            (_a = _this.logger) === null || _a === void 0 ? void 0 : _a.error('[WebSocket Error]', e);
            // 连接中，返回连接失败
            if (_this._connecting) {
                _this._connecting.rs({
                    isSucc: false,
                    errMsg: "Failed to connect to WebSocket server: ".concat(_this.options.server)
                });
                _this._connecting = undefined;
                (_b = _this.logger) === null || _b === void 0 ? void 0 : _b.error("Failed to connect to WebSocket server: ".concat(_this.options.server));
            }
        };
        _this._onWsMessage = function (data) {
            if (_this._status !== exports.WsClientStatus.Opened) {
                return;
            }
            // 心跳包回包
            if (data instanceof Uint8Array && data.length === TransportDataUtil.HeartbeatPacket.length && data.every(function (v, i) { return v === TransportDataUtil.HeartbeatPacket[i]; })) {
                _this._onHeartbeatAnswer(data);
                return;
            }
            _this._onRecvData(data);
        };
        // #region Heartbeat
        /**
         * Last latency time (ms) of heartbeat test
         */
        _this.lastHeartbeatLatency = 0;
        // #endregion
        _this._status = exports.WsClientStatus.Closed;
        _this._wsp = wsp;
        wsp.options = {
            onOpen: _this._onWsOpen,
            onClose: _this._onWsClose,
            onError: _this._onWsError,
            onMessage: _this._onWsMessage,
            logger: _this.logger
        };
        (_a = _this.logger) === null || _a === void 0 ? void 0 : _a.log('TSRPC WebSocket Client :', _this.options.server);
        return _this;
    }
    BaseWsClient.prototype._sendData = function (data) {
        return tslib.__awaiter(this, void 0, void 0, function () {
            var _this = this;
            return tslib.__generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (rs) { return tslib.__awaiter(_this, void 0, void 0, function () {
                        return tslib.__generator(this, function (_a) {
                            if (!this.isConnected) {
                                rs({
                                    err: new tsrpcProto.TsrpcError('WebSocket is not connected', {
                                        code: 'WS_NOT_OPEN',
                                        type: tsrpcProto.TsrpcError.Type.ClientError
                                    })
                                });
                                return [2 /*return*/];
                            }
                            // Do Send
                            rs(this._wsp.send(data));
                            return [2 /*return*/];
                        });
                    }); })];
            });
        });
    };
    /**
     * Send a heartbeat packet
     */
    BaseWsClient.prototype._heartbeat = function () {
        var _this = this;
        var _a;
        if (this._pendingHeartbeat || this._status !== exports.WsClientStatus.Opened || !this.options.heartbeat) {
            return;
        }
        this._pendingHeartbeat = {
            startTime: Date.now(),
            timeoutTimer: setTimeout(function () {
                var _a;
                _this._pendingHeartbeat = undefined;
                // heartbeat timeout, disconnect if still connected
                (_a = _this.logger) === null || _a === void 0 ? void 0 : _a.error('[Heartbeat] Heartbeat timeout, the connection disconnected automatically.');
                if (_this._status === exports.WsClientStatus.Opened) {
                    _this._wsClose(3000, 'Heartbeat timeout');
                    _this._wsp.options.onClose(3000, 'Heartbeat timeout');
                }
            }, this.options.heartbeat.timeout)
        };
        this.options.debugBuf && ((_a = this.logger) === null || _a === void 0 ? void 0 : _a.log('[Heartbeat] Send ping', TransportDataUtil.HeartbeatPacket));
        this._sendData(TransportDataUtil.HeartbeatPacket);
    };
    BaseWsClient.prototype._onHeartbeatAnswer = function (data) {
        var _this = this;
        var _a;
        if (!this._pendingHeartbeat || this._status !== exports.WsClientStatus.Opened || !this.options.heartbeat) {
            return;
        }
        // heartbeat succ
        this.lastHeartbeatLatency = Date.now() - this._pendingHeartbeat.startTime;
        this.options.debugBuf && ((_a = this.logger) === null || _a === void 0 ? void 0 : _a.log("[Heartbeat] Recv pong, latency=".concat(this.lastHeartbeatLatency, "ms"), data));
        clearTimeout(this._pendingHeartbeat.timeoutTimer);
        this._pendingHeartbeat = undefined;
        // next heartbeat timer
        this._nextHeartbeatTimer = setTimeout(function () {
            _this._heartbeat();
        }, this.options.heartbeat.interval);
    };
    Object.defineProperty(BaseWsClient.prototype, "status", {
        get: function () {
            return this._status;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(BaseWsClient.prototype, "isConnected", {
        get: function () {
            return this._status === exports.WsClientStatus.Opened;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Start connecting, you must connect first before `callApi()` and `sendMsg()`.
     * @throws never
     */
    BaseWsClient.prototype.connect = function () {
        var _a, _b;
        return tslib.__awaiter(this, void 0, void 0, function () {
            var pre, promiseConnect;
            var _this = this;
            return tslib.__generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        // 已连接成功
                        if (this.isConnected) {
                            return [2 /*return*/, { isSucc: true }];
                        }
                        // 已连接中
                        if (this._connecting) {
                            return [2 /*return*/, this._connecting.promise];
                        }
                        return [4 /*yield*/, this.flows.preConnectFlow.exec({}, this.logger)];
                    case 1:
                        pre = _c.sent();
                        // Pre return
                        if (pre === null || pre === void 0 ? void 0 : pre.return) {
                            return [2 /*return*/, pre.return];
                        }
                        // Canceled
                        if (!pre) {
                            return [2 /*return*/, new Promise(function (rs) { })];
                        }
                        try {
                            this._wsp.connect(this.options.server, [this.options.json ? 'text' : 'buffer']);
                        }
                        catch (e) {
                            (_a = this.logger) === null || _a === void 0 ? void 0 : _a.error(e);
                            return [2 /*return*/, { isSucc: false, errMsg: e.message }];
                        }
                        this._status = exports.WsClientStatus.Opening;
                        (_b = this.logger) === null || _b === void 0 ? void 0 : _b.log("Start connecting ".concat(this.options.server, "..."));
                        this._connecting = {};
                        promiseConnect = new Promise(function (rs) {
                            _this._connecting.rs = rs;
                        });
                        this._connecting.promise = promiseConnect;
                        return [2 /*return*/, promiseConnect];
                }
            });
        });
    };
    /**
     * Disconnect immediately
     * @throws never
     */
    BaseWsClient.prototype.disconnect = function (code, reason) {
        var _a;
        return tslib.__awaiter(this, void 0, void 0, function () {
            var isClosed;
            var _this = this;
            return tslib.__generator(this, function (_b) {
                if (this._status === exports.WsClientStatus.Closed) {
                    return [2 /*return*/];
                }
                this._status = exports.WsClientStatus.Closing;
                (_a = this.logger) === null || _a === void 0 ? void 0 : _a.log('Start disconnecting...');
                isClosed = false;
                return [2 /*return*/, Promise.race([
                        // 正常等待 onClose 关闭
                        new Promise(function (rs) {
                            _this._rsDisconnecting = function () {
                                if (isClosed) {
                                    return;
                                }
                                isClosed = true;
                                rs();
                            };
                            _this._wsClose(code !== null && code !== void 0 ? code : 1000, reason !== null && reason !== void 0 ? reason : '');
                        }),
                        // 超时保护，1 秒未收到关闭请求的，直接 onClose 掉
                        new Promise(function (rs) {
                            setTimeout(function () {
                                if (isClosed) {
                                    return;
                                }
                                isClosed = true;
                                _this._onWsClose(1005, 'Connection closed, but not received ws.onClose event.');
                            }, 1000);
                        })
                    ])];
            });
        });
    };
    BaseWsClient.prototype._wsClose = function (code, reason) {
        var _a;
        try {
            this._wsp.close(code !== null && code !== void 0 ? code : 1000, reason !== null && reason !== void 0 ? reason : '');
        }
        catch (e) {
            (_a = this.logger) === null || _a === void 0 ? void 0 : _a.error('[WsCloseError]', e);
        }
    };
    return BaseWsClient;
}(BaseClient));
var defaultBaseWsClientOptions = tslib.__assign(tslib.__assign({}, defaultBaseClientOptions), { server: 'ws://localhost:3000' });
exports.WsClientStatus = void 0;
(function (WsClientStatus) {
    WsClientStatus["Opening"] = "OPENING";
    WsClientStatus["Opened"] = "OPENED";
    WsClientStatus["Closing"] = "CLOSING";
    WsClientStatus["Closed"] = "CLOSED";
})(exports.WsClientStatus || (exports.WsClientStatus = {}));

exports.BaseClient = BaseClient;
exports.BaseHttpClient = BaseHttpClient;
exports.BaseWsClient = BaseWsClient;
exports.Counter = Counter;
exports.Flow = Flow;
exports.MsgHandlerManager = MsgHandlerManager;
exports.ServiceMapUtil = ServiceMapUtil;
exports.TransportDataUtil = TransportDataUtil;
exports.defaultBaseClientOptions = defaultBaseClientOptions;
exports.defaultBaseHttpClientOptions = defaultBaseHttpClientOptions;
exports.defaultBaseWsClientOptions = defaultBaseWsClientOptions;
exports.getCustomObjectIdTypes = getCustomObjectIdTypes;

}, function(modId) {var map = {}; return __REQUIRE__(map[modId], modId); })
return __REQUIRE__(1667821180097);
})()
//miniprogram-npm-outsideDeps=["k8w-extend-native","tslib","tsbuffer","tsrpc-proto","tsbuffer-schema"]
//# sourceMappingURL=index.js.map