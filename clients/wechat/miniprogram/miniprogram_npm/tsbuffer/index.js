module.exports = (function() {
var __MODS__ = {};
var __DEFINE__ = function(modId, func, req) { var m = { exports: {}, _tempexports: {} }; __MODS__[modId] = { status: 0, func: func, req: req, m: m }; };
var __REQUIRE__ = function(modId, source) { if(!__MODS__[modId]) return require(source); if(!__MODS__[modId].status) { var m = __MODS__[modId].m; m._exports = m._tempexports; var desp = Object.getOwnPropertyDescriptor(m, "exports"); if (desp && desp.configurable) Object.defineProperty(m, "exports", { set: function (val) { if(typeof val === "object" && val !== m._exports) { m._exports.__proto__ = val.__proto__; Object.keys(val).forEach(function (k) { m._exports[k] = val[k]; }); } m._tempexports = val }, get: function () { return m._tempexports; } }); __MODS__[modId].status = 1; __MODS__[modId].func(__MODS__[modId].req, m, m.exports); } return __MODS__[modId].m.exports; };
var __REQUIRE_WILDCARD__ = function(obj) { if(obj && obj.__esModule) { return obj; } else { var newObj = {}; if(obj != null) { for(var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) newObj[k] = obj[k]; } } newObj.default = obj; return newObj; } };
var __REQUIRE_DEFAULT__ = function(obj) { return obj && obj.__esModule ? obj.default : obj; };
__DEFINE__(1667821180095, function(require, module, exports) {
/*!
 * TSBuffer v2.2.6
 * -----------------------------------------
 * MIT LICENSE
 * KingWorks (C) Copyright 2022
 * https://github.com/k8w/tsbuffer
 */


Object.defineProperty(exports, '__esModule', { value: true });

require('k8w-extend-native');
var tslib = require('tslib');
var tsbufferValidator = require('tsbuffer-validator');
var tsbufferSchema = require('tsbuffer-schema');

var Base64Util = /** @class */ (function () {
    function Base64Util() {
    }
    Base64Util.bufferToBase64 = function (buf) {
        if (typeof Buffer !== 'undefined') {
            return Buffer.from(buf).toString('base64');
        }
        var base64 = '';
        var len = buf.length;
        for (var i = 0; i < len; i += 3) {
            base64 += base64Chars[buf[i] >> 2];
            base64 += base64Chars[((buf[i] & 3) << 4) | (buf[i + 1] >> 4)];
            base64 += base64Chars[((buf[i + 1] & 15) << 2) | (buf[i + 2] >> 6)];
            base64 += base64Chars[buf[i + 2] & 63];
        }
        if (len % 3 === 2) {
            base64 = base64.substring(0, base64.length - 1) + '=';
        }
        else if (len % 3 === 1) {
            base64 = base64.substring(0, base64.length - 2) + '==';
        }
        return base64;
    };
    Base64Util.base64ToBuffer = function (base64) {
        if (typeof Buffer !== 'undefined') {
            return new Uint8Array(Buffer.from(base64, 'base64'));
        }
        var bufferLength = base64.length * 0.75, len = base64.length, p = 0;
        var encoded1, encoded2, encoded3, encoded4;
        if (base64[base64.length - 1] === '=') {
            bufferLength--;
            if (base64[base64.length - 2] === '=') {
                bufferLength--;
            }
        }
        var buf = new Uint8Array(bufferLength);
        for (var i = 0; i < len; i += 4) {
            encoded1 = lookup[base64.charCodeAt(i)];
            encoded2 = lookup[base64.charCodeAt(i + 1)];
            encoded3 = lookup[base64.charCodeAt(i + 2)];
            encoded4 = lookup[base64.charCodeAt(i + 3)];
            buf[p++] = (encoded1 << 2) | (encoded2 >> 4);
            buf[p++] = ((encoded2 & 15) << 4) | (encoded3 >> 2);
            buf[p++] = ((encoded3 & 3) << 6) | (encoded4 & 63);
        }
        return buf;
    };
    return Base64Util;
}());
/*base64*/
var base64Chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
// Use a lookup table to find the index.
var lookup = typeof Uint8Array === 'undefined' ? [] : new Uint8Array(256);
for (var i = 0; i < base64Chars.length; i++) {
    lookup[base64Chars.charCodeAt(i)] = i;
}
/*end*/

var CoderUtil = /** @class */ (function () {
    function CoderUtil() {
    }
    CoderUtil.isJsonCompatible = function (schema, type, protoHelper) {
        var _this = this;
        var schemaInfo = schema;
        var key = type === 'encode' ? 'isJsonEncodable' : 'isJsonDecodable';
        if (schemaInfo[key] === undefined) {
            switch (schema.type) {
                case tsbufferSchema.SchemaType.Array:
                    schemaInfo[key] = this.isJsonCompatible(schema.elementType, type, protoHelper);
                    break;
                case tsbufferSchema.SchemaType.Tuple:
                    schemaInfo[key] = schema.elementTypes.every(function (v) { return _this.isJsonCompatible(v, type, protoHelper); });
                    break;
                case tsbufferSchema.SchemaType.Interface:
                    var flatSchema = protoHelper.getFlatInterfaceSchema(schema);
                    schemaInfo[key] = flatSchema.properties.every(function (v) { return _this.isJsonCompatible(v.type, type, protoHelper); });
                    if (flatSchema.indexSignature) {
                        schemaInfo[key] = schemaInfo[key] && this.isJsonCompatible(flatSchema.indexSignature.type, type, protoHelper);
                    }
                    break;
                case tsbufferSchema.SchemaType.IndexedAccess:
                case tsbufferSchema.SchemaType.Reference: {
                    var parsed = protoHelper.parseReference(schema);
                    schemaInfo[key] = this.isJsonCompatible(parsed, type, protoHelper);
                    break;
                }
                case tsbufferSchema.SchemaType.Union:
                case tsbufferSchema.SchemaType.Intersection:
                    schemaInfo[key] = schema.members.every(function (v) { return _this.isJsonCompatible(v.type, type, protoHelper); });
                    break;
                case tsbufferSchema.SchemaType.NonNullable:
                    schemaInfo[key] = this.isJsonCompatible(schema.target, type, protoHelper);
                    break;
                case tsbufferSchema.SchemaType.Pick:
                case tsbufferSchema.SchemaType.Partial:
                case tsbufferSchema.SchemaType.Omit:
                case tsbufferSchema.SchemaType.Overwrite: {
                    var parsed = protoHelper.parseMappedType(schema);
                    schemaInfo[key] = this.isJsonCompatible(parsed, type, protoHelper);
                    break;
                }
                case tsbufferSchema.SchemaType.Custom:
                case tsbufferSchema.SchemaType.Date:
                case tsbufferSchema.SchemaType.Buffer:
                    schemaInfo[key] = false;
                    break;
                default:
                    schemaInfo[key] = true;
                    break;
            }
        }
        return schemaInfo[key];
    };
    return CoderUtil;
}());

/** @internal */
var IdBlockUtil = /** @class */ (function () {
    function IdBlockUtil() {
    }
    IdBlockUtil.getPayloadLengthInfo = function (parsedSchema, protoHelper) {
        switch (parsedSchema.type) {
            case tsbufferSchema.SchemaType.Boolean:
            case tsbufferSchema.SchemaType.Enum:
                return { lengthType: LengthType.Varint };
            case tsbufferSchema.SchemaType.Number:
                if (!parsedSchema.scalarType || parsedSchema.scalarType.includes('64') || parsedSchema.scalarType === 'double') {
                    return { lengthType: LengthType.Bit64 };
                }
                else if (parsedSchema.scalarType && parsedSchema.scalarType.startsWith('big')) {
                    return { lengthType: LengthType.LengthDelimited };
                }
                else {
                    return { lengthType: LengthType.Varint };
                }
            case tsbufferSchema.SchemaType.Buffer:
            case tsbufferSchema.SchemaType.String:
            case tsbufferSchema.SchemaType.Any:
            case tsbufferSchema.SchemaType.Object:
                return { lengthType: LengthType.LengthDelimited };
            case tsbufferSchema.SchemaType.Interface:
            case tsbufferSchema.SchemaType.Pick:
            case tsbufferSchema.SchemaType.Partial:
            case tsbufferSchema.SchemaType.Omit:
            case tsbufferSchema.SchemaType.Union:
            case tsbufferSchema.SchemaType.Intersection:
                return { lengthType: LengthType.IdBlock };
            case tsbufferSchema.SchemaType.Array:
            case tsbufferSchema.SchemaType.Overwrite:
            case tsbufferSchema.SchemaType.Tuple:
                return {
                    lengthType: LengthType.LengthDelimited,
                    needLengthPrefix: true
                };
            case tsbufferSchema.SchemaType.Literal:
                return {
                    lengthType: LengthType.LengthDelimited,
                    needLengthPrefix: false
                };
            case tsbufferSchema.SchemaType.Date:
                return { lengthType: LengthType.Varint };
            case tsbufferSchema.SchemaType.NonNullable:
                return this.getPayloadLengthInfo(protoHelper.parseReference(parsedSchema.target), protoHelper);
            case tsbufferSchema.SchemaType.Custom:
                return { lengthType: LengthType.LengthDelimited };
            default:
                // @ts-expect-error
                throw new Error("Unrecognized schema type: ".concat(parsedSchema.type));
        }
    };
    return IdBlockUtil;
}());
/** @internal */
var LengthType;
(function (LengthType) {
    LengthType[LengthType["LengthDelimited"] = 0] = "LengthDelimited";
    LengthType[LengthType["Varint"] = 1] = "Varint";
    LengthType[LengthType["Bit64"] = 2] = "Bit64";
    LengthType[LengthType["IdBlock"] = 3] = "IdBlock";
})(LengthType || (LengthType = {}));

/** @internal */
var SchemaUtil = /** @class */ (function () {
    function SchemaUtil() {
    }
    /** type类型是否能编码为该literal */
    SchemaUtil.canBeLiteral = function (schema, literal) {
        var _this = this;
        if (schema.type === tsbufferSchema.SchemaType.Union) {
            return schema.members.some(function (v) { return _this.canBeLiteral(v.type, literal); });
        }
        if (schema.type === tsbufferSchema.SchemaType.Any) {
            return true;
        }
        if (schema.type === tsbufferSchema.SchemaType.Literal && schema.literal === literal) {
            return true;
        }
        return false;
    };
    return SchemaUtil;
}());

var TypedArrays = {
    Int8Array: Int8Array,
    Int16Array: Int16Array,
    Int32Array: Int32Array,
    Uint8Array: Uint8Array,
    Uint16Array: Uint16Array,
    Uint32Array: Uint32Array,
    Float32Array: Float32Array,
    Float64Array: Float64Array
};

/**!
 * From [protobuf.js](https://github.com/protobufjs/protobuf.js/blob/master/lib/utf8/index.js)
 */
var Utf8CoderJS = {
    measureLength: function (str) {
        var len = 0, c = 0;
        for (var i = 0; i < str.length; ++i) {
            c = str.charCodeAt(i);
            if (c < 128)
                len += 1;
            else if (c < 2048)
                len += 2;
            else if ((c & 0xFC00) === 0xD800 && (str.charCodeAt(i + 1) & 0xFC00) === 0xDC00) {
                ++i;
                len += 4;
            }
            else
                len += 3;
        }
        return len;
    },
    write: function (str, buf, pos) {
        var start = pos, c1, // character 1
        c2; // character 2
        for (var i = 0; i < str.length; ++i) {
            c1 = str.charCodeAt(i);
            if (c1 < 128) {
                buf[pos++] = c1;
            }
            else if (c1 < 2048) {
                buf[pos++] = c1 >> 6 | 192;
                buf[pos++] = c1 & 63 | 128;
            }
            else if ((c1 & 0xFC00) === 0xD800 && ((c2 = str.charCodeAt(i + 1)) & 0xFC00) === 0xDC00) {
                c1 = 0x10000 + ((c1 & 0x03FF) << 10) + (c2 & 0x03FF);
                ++i;
                buf[pos++] = c1 >> 18 | 240;
                buf[pos++] = c1 >> 12 & 63 | 128;
                buf[pos++] = c1 >> 6 & 63 | 128;
                buf[pos++] = c1 & 63 | 128;
            }
            else {
                buf[pos++] = c1 >> 12 | 224;
                buf[pos++] = c1 >> 6 & 63 | 128;
                buf[pos++] = c1 & 63 | 128;
            }
        }
        return pos - start;
    },
    read: function (buf, pos, length) {
        if (length < 1) {
            return "";
        }
        var str = "";
        for (var i = pos, end = pos + length; i < end;) {
            var t = buf[i++];
            if (t <= 0x7F) {
                str += String.fromCharCode(t);
            }
            else if (t >= 0xC0 && t < 0xE0) {
                str += String.fromCharCode((t & 0x1F) << 6 | buf[i++] & 0x3F);
            }
            else if (t >= 0xE0 && t < 0xF0) {
                str += String.fromCharCode((t & 0xF) << 12 | (buf[i++] & 0x3F) << 6 | buf[i++] & 0x3F);
            }
            else if (t >= 0xF0) {
                var t2 = ((t & 7) << 18 | (buf[i++] & 0x3F) << 12 | (buf[i++] & 0x3F) << 6 | buf[i++] & 0x3F) - 0x10000;
                str += String.fromCharCode(0xD800 + (t2 >> 10));
                str += String.fromCharCode(0xDC00 + (t2 & 0x3FF));
            }
        }
        return str;
    }
};
var Utf8CoderNode = {
    measureLength: function (str) { return Buffer.byteLength(str, 'utf-8'); },
    write: function (str, buf, pos) { return Buffer.from(buf.buffer, buf.byteOffset, buf.byteLength).write(str, pos, 'utf-8'); },
    read: function (buf, pos, length) { return Buffer.from(buf.buffer, buf.byteOffset, buf.byteLength).toString('utf-8', pos, pos + length); }
};
/**
 * 自动判断环境，选择使用NodeJS Native方法编码或是JS编码
 */
var Utf8Coder = typeof Buffer !== 'undefined' && Buffer.from && Buffer.prototype.write ? Utf8CoderNode : Utf8CoderJS;

/** @internal */
var Varint64 = /** @class */ (function () {
    function Varint64(high, low, byteLength) {
        this.uint32s = new Uint32Array([high, low]);
        if (byteLength !== undefined) {
            this._byteLength = byteLength;
        }
    }
    Varint64.from = function (value) {
        if (value === 0) {
            return this.Zero;
        }
        var sign = value < 0;
        if (sign) {
            value = -value;
        }
        var lo = value >>> 0, hi = (value - lo) / 4294967296 >>> 0;
        if (sign) {
            hi = ~hi >>> 0;
            lo = ~lo >>> 0;
            if (++lo > 4294967295) {
                lo = 0;
                if (++hi > 4294967295)
                    hi = 0;
            }
        }
        return new Varint64(hi, lo);
    };
    Varint64.prototype.toNumber = function (unsigned) {
        if (!unsigned && this.uint32s[0] >>> 31) {
            var low = ~this.uint32s[1] + 1 >>> 0, high = ~this.uint32s[0] >>> 0;
            if (!low)
                high = high + 1 >>> 0;
            return -(low + high * 4294967296);
        }
        return this.uint32s[1] + this.uint32s[0] * 4294967296;
    };
    Varint64.prototype.zzEncode = function () {
        var mask = this.uint32s[0] >> 31;
        this.uint32s[0] = ((this.uint32s[0] << 1 | this.uint32s[1] >>> 31) ^ mask) >>> 0;
        this.uint32s[1] = (this.uint32s[1] << 1 ^ mask) >>> 0;
        return this;
    };
    Varint64.prototype.zzDecode = function () {
        var mask = -(this.uint32s[1] & 1);
        this.uint32s[1] = ((this.uint32s[1] >>> 1 | this.uint32s[0] << 31) ^ mask) >>> 0;
        this.uint32s[0] = (this.uint32s[0] >>> 1 ^ mask) >>> 0;
        return this;
    };
    Object.defineProperty(Varint64.prototype, "byteLength", {
        get: function () {
            if (this._byteLength === undefined) {
                var part0 = this.uint32s[1], part1 = (this.uint32s[1] >>> 28 | this.uint32s[0] << 4) >>> 0, part2 = this.uint32s[0] >>> 24;
                this._byteLength = part2 === 0
                    ? part1 === 0
                        ? part0 < 16384
                            ? part0 < 128 ? 1 : 2
                            : part0 < 2097152 ? 3 : 4
                        : part1 < 16384
                            ? part1 < 128 ? 5 : 6
                            : part1 < 2097152 ? 7 : 8
                    : part2 < 128 ? 9 : 10;
            }
            return this._byteLength;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * 编码
     * @param buf
     * @param pos
     * @returns 编码后最新的pos
     */
    Varint64.prototype.writeToBuffer = function (buf, pos) {
        while (this.uint32s[0]) {
            buf[pos++] = this.uint32s[1] & 127 | 128;
            this.uint32s[1] = (this.uint32s[1] >>> 7 | this.uint32s[0] << 25) >>> 0;
            this.uint32s[0] >>>= 7;
        }
        while (this.uint32s[1] > 127) {
            buf[pos++] = this.uint32s[1] & 127 | 128;
            this.uint32s[1] = this.uint32s[1] >>> 7;
        }
        buf[pos++] = this.uint32s[1];
        return pos;
    };
    Varint64.readFromBuffer = function (buf, pos) {
        var startPos = pos;
        var hi = 0, lo = 0;
        var i = 0;
        if (buf.byteLength - pos > 4) { // fast route (lo)
            for (; i < 4; ++i) {
                // 1st..4th
                lo = (lo | (buf[pos] & 127) << i * 7) >>> 0;
                if (buf[pos++] < 128)
                    return new Varint64(hi, lo, pos - startPos);
            }
            // 5th
            lo = (lo | (buf[pos] & 127) << 28) >>> 0;
            hi = (hi | (buf[pos] & 127) >> 4) >>> 0;
            if (buf[pos++] < 128)
                return new Varint64(hi, lo, pos - startPos);
            i = 0;
        }
        else {
            for (; i < 3; ++i) {
                /* istanbul ignore if */
                if (pos >= buf.byteLength)
                    throw new Error('Read varint error: index out of range');
                // 1st..3th
                lo = (lo | (buf[pos] & 127) << i * 7) >>> 0;
                if (buf[pos++] < 128)
                    return new Varint64(hi, lo, pos - startPos);
            }
            // 4th
            lo = (lo | (buf[pos++] & 127) << i * 7) >>> 0;
            return new Varint64(hi, lo, pos - startPos);
        }
        if (buf.byteLength - pos > 4) { // fast route (hi)
            for (; i < 5; ++i) {
                // 6th..10th
                hi = (hi | (buf[pos] & 127) << i * 7 + 3) >>> 0;
                if (buf[pos++] < 128)
                    return new Varint64(hi, lo, pos - startPos);
            }
        }
        else {
            for (; i < 5; ++i) {
                /* istanbul ignore if */
                if (pos >= buf.byteLength)
                    throw new Error('Read varint error: index out of range');
                // 6th..10th
                hi = (hi | (buf[pos] & 127) << i * 7 + 3) >>> 0;
                if (buf[pos++] < 128)
                    return new Varint64(hi, lo, pos - startPos);
            }
        }
        /* istanbul ignore next */
        throw Error("invalid varint encoding");
    };
    Varint64.Zero = new Varint64(0, 0);
    return Varint64;
}());

var BufferReader = /** @class */ (function () {
    function BufferReader() {
        this._pos = 0;
    }
    BufferReader.prototype.load = function (buf, pos) {
        if (pos === void 0) { pos = 0; }
        this._buf = buf;
        this._pos = pos;
        this._view = new DataView(buf.buffer);
    };
    BufferReader.prototype.readVarint = function () {
        var varint = Varint64.readFromBuffer(this._buf, this._pos);
        this._pos += varint.byteLength;
        return varint;
    };
    BufferReader.prototype.readUint = function () {
        return this.readVarint().toNumber(true);
    };
    BufferReader.prototype.readInt = function () {
        return this.readVarint().zzDecode().toNumber();
    };
    BufferReader.prototype.readDouble = function () {
        var pos = this._pos;
        this._pos += 8;
        return this._view.getFloat64(this._buf.byteOffset + pos);
    };
    BufferReader.prototype.readString = function () {
        var strByteLength = this.readUint();
        var str = Utf8Coder.read(this._buf, this._pos, strByteLength);
        this._pos += strByteLength;
        return str;
    };
    BufferReader.prototype.readBuffer = function () {
        var bufByteLength = this.readUint();
        var buf = this._buf.subarray(this._pos, this._pos + bufByteLength);
        this._pos += bufByteLength;
        return buf;
    };
    BufferReader.prototype.skip = function (byteLength) {
        this._pos += byteLength;
    };
    BufferReader.prototype.skipByLengthType = function (lengthType) {
        if (lengthType === LengthType.Bit64) {
            this._pos += 8;
        }
        else if (lengthType === LengthType.Varint) {
            this.readVarint();
        }
        else if (lengthType === LengthType.LengthDelimited) {
            var bufByteLength = this.readUint();
            this._pos += bufByteLength;
        }
        else if (lengthType === LengthType.IdBlock) {
            this.skipIdBlock();
        }
        else {
            throw new Error('Unknown lengthType: ' + lengthType);
        }
    };
    BufferReader.prototype.skipIdBlock = function () {
        var idNum = this.readUint();
        for (var i = 0; i < idNum; ++i) {
            var id = this.readUint();
            var lengthType = id & 3;
            this.skipByLengthType(lengthType);
        }
    };
    BufferReader.prototype.readBoolean = function () {
        var value = this._view.getUint8(this._buf.byteOffset + this._pos++);
        if (value === 255) {
            return true;
        }
        else if (value === 0) {
            return false;
        }
        else {
            throw new Error("Invalid boolean encoding [".concat(value, "] at pos ").concat(this._pos - 1));
        }
    };
    Object.defineProperty(BufferReader.prototype, "unreadByteLength", {
        get: function () {
            return this._buf.byteLength - this._pos;
        },
        enumerable: false,
        configurable: true
    });
    BufferReader.prototype.dispose = function () {
        this._buf = this._view = undefined;
    };
    return BufferReader;
}());

/** @internal */
var Decoder = /** @class */ (function () {
    function Decoder(options) {
        this._options = options;
        this._reader = new BufferReader();
        this._validator = options.validator;
    }
    Decoder.prototype.decode = function (buffer, schema) {
        this._reader.load(buffer);
        return this._read(schema);
    };
    Decoder.prototype.decodeJSON = function (json, schema) {
        var _this = this;
        if (json === null || CoderUtil.isJsonCompatible(schema, 'decode', this._validator.protoHelper)) {
            return json;
        }
        // 递归 只处理 ArrayBuffer、Date、ObjectId
        switch (schema.type) {
            case tsbufferSchema.SchemaType.Array:
                if (!Array.isArray(json)) {
                    break;
                }
                return json.map(function (v) { return _this.decodeJSON(v, schema.elementType); });
            case tsbufferSchema.SchemaType.Tuple:
                if (!Array.isArray(json)) {
                    break;
                }
                return json.map(function (v, i) { return _this.decodeJSON(v, schema.elementTypes[i]); });
            case tsbufferSchema.SchemaType.Interface:
                if (json.constructor !== Object) {
                    break;
                }
                json = Object.assign({}, json);
                var flatSchema = this._validator.protoHelper.getFlatInterfaceSchema(schema);
                var _loop_1 = function (key) {
                    var property = flatSchema.properties.find(function (v) { return v.name === key; });
                    if (property) {
                        json[key] = this_1.decodeJSON(json[key], property.type);
                    }
                    else if (flatSchema.indexSignature) {
                        json[key] = this_1.decodeJSON(json[key], flatSchema.indexSignature.type);
                    }
                };
                var this_1 = this;
                for (var key in json) {
                    _loop_1(key);
                }
                return json;
            case tsbufferSchema.SchemaType.Date:
                if (typeof json !== 'string' && typeof json !== 'number') {
                    break;
                }
                return new Date(json);
            case tsbufferSchema.SchemaType.Partial:
            case tsbufferSchema.SchemaType.Pick:
            case tsbufferSchema.SchemaType.Omit:
            case tsbufferSchema.SchemaType.Overwrite:
                var parsed = this._validator.protoHelper.parseMappedType(schema);
                return this.decodeJSON(json, parsed);
            case tsbufferSchema.SchemaType.Buffer:
                if (typeof json !== 'string') {
                    break;
                }
                var uint8Arr = Base64Util.base64ToBuffer(json);
                return this._getBufferValue(uint8Arr, schema);
            case tsbufferSchema.SchemaType.IndexedAccess:
            case tsbufferSchema.SchemaType.Reference:
            case tsbufferSchema.SchemaType.Keyof:
                return this.decodeJSON(json, this._validator.protoHelper.parseReference(schema));
            case tsbufferSchema.SchemaType.Union:
            case tsbufferSchema.SchemaType.Intersection: {
                // 逐个编码 然后合并 （失败的会原值返回，所以不影响结果）
                for (var _i = 0, _a = schema.members; _i < _a.length; _i++) {
                    var member = _a[_i];
                    json = this.decodeJSON(json, member.type);
                }
                return json;
            }
            case tsbufferSchema.SchemaType.NonNullable:
                return this.decodeJSON(json, schema.target);
            case tsbufferSchema.SchemaType.Custom:
                if (schema.decodeJSON) {
                    return schema.decodeJSON(json);
                }
                break;
            default:
                schema.type;
        }
        return json;
    };
    Decoder.prototype._read = function (schema) {
        switch (schema.type) {
            case tsbufferSchema.SchemaType.Boolean:
                return this._reader.readBoolean();
            case tsbufferSchema.SchemaType.Number:
                return this._readNumber(schema);
            case tsbufferSchema.SchemaType.String:
                return this._reader.readString();
            case tsbufferSchema.SchemaType.Array: {
                var output = [];
                // 数组长度：Varint
                var length_1 = this._reader.readUint();
                for (var i = 0; i < length_1; ++i) {
                    var item = this._read(schema.elementType);
                    output.push(item);
                }
                return output;
            }
            case tsbufferSchema.SchemaType.Tuple: {
                if (schema.elementTypes.length > 64) {
                    throw new Error('Elements oversized, maximum supported tuple elements is 64, now get ' + schema.elementTypes.length);
                }
                var output = [];
                // PayloadMask: Varint64
                var payloadMask = this._reader.readVarint();
                // 计算maskIndices
                var maskIndices = [];
                // Low
                for (var i = 0; i < 32; ++i) {
                    if (payloadMask.uint32s[1] & 1 << i) {
                        maskIndices.push(i);
                    }
                }
                // High
                for (var i = 0; i < 32; ++i) {
                    if (payloadMask.uint32s[0] & 1 << i) {
                        maskIndices.push(i + 32);
                    }
                }
                if (!maskIndices.length) {
                    return [];
                }
                var maxIndex = maskIndices.last();
                for (var i = 0, nextMaskIndex = 0, next = maskIndices[0]; i <= maxIndex; ++i) {
                    if (i === next) {
                        output[i] = this._read(schema.elementTypes[i]);
                        ++nextMaskIndex;
                        next = maskIndices[nextMaskIndex];
                    }
                    else {
                        output[i] = undefined;
                    }
                }
                // undefined as null
                for (var i = 0; i < schema.elementTypes.length; ++i) {
                    if (this._undefinedAsNull(output[i], schema.elementTypes[i], schema.optionalStartIndex !== undefined && i >= schema.optionalStartIndex)) {
                        output[i] = null;
                    }
                }
                return output;
            }
            case tsbufferSchema.SchemaType.Enum:
                var enumId_1 = this._reader.readVarint().toNumber();
                var enumItem = schema.members.find(function (v) { return v.id === enumId_1; });
                if (!enumItem) {
                    throw new Error("Invalid enum encoding: unexpected id ".concat(enumId_1));
                }
                return enumItem.value;
            case tsbufferSchema.SchemaType.Any:
            case tsbufferSchema.SchemaType.Object:
                var jsonStr = this._reader.readString();
                if (jsonStr === 'undefined') {
                    return undefined;
                }
                return JSON.parse(jsonStr);
            case tsbufferSchema.SchemaType.Literal:
                return schema.literal;
            case tsbufferSchema.SchemaType.Interface:
                return this._readInterface(schema);
            case tsbufferSchema.SchemaType.Buffer:
                var uint8Arr = this._reader.readBuffer();
                return this._getBufferValue(uint8Arr, schema);
            case tsbufferSchema.SchemaType.IndexedAccess:
            case tsbufferSchema.SchemaType.Reference:
            case tsbufferSchema.SchemaType.Keyof:
                return this._read(this._validator.protoHelper.parseReference(schema));
            case tsbufferSchema.SchemaType.Partial:
            case tsbufferSchema.SchemaType.Pick:
            case tsbufferSchema.SchemaType.Omit:
            case tsbufferSchema.SchemaType.Overwrite:
                var parsed = this._validator.protoHelper.parseMappedType(schema);
                if (parsed.type === tsbufferSchema.SchemaType.Interface) {
                    return this._readPureMappedType(schema);
                }
                else {
                    return this._readUnionOrIntersection(parsed);
                }
            case tsbufferSchema.SchemaType.Union:
            case tsbufferSchema.SchemaType.Intersection:
                return this._readUnionOrIntersection(schema);
            case tsbufferSchema.SchemaType.Date:
                return new Date(this._reader.readUint());
            case tsbufferSchema.SchemaType.NonNullable:
                return this._read(schema.target);
            case tsbufferSchema.SchemaType.Custom:
                if (!schema.decode) {
                    throw new Error('Missing decode method for CustomTypeSchema');
                }
                var buf = this._reader.readBuffer();
                return schema.decode(buf);
            default:
                // @ts-expect-error
                throw new Error("Unrecognized schema type: ".concat(schema.type));
        }
    };
    /**
     * PureMappedType 每一层的target 都是MappedType或Interface（最终层）
     */
    Decoder.prototype._readPureMappedType = function (schema) {
        var output;
        var overwrite;
        if (schema.type === 'Overwrite') {
            // Overwrite Block
            overwrite = this._read(schema.overwrite);
        }
        var parsedTarget = this._validator.protoHelper.parseReference(schema.target);
        if (parsedTarget.type === 'Interface') {
            output = this._readInterface(parsedTarget);
        }
        else if (parsedTarget.type === 'Pick' || parsedTarget.type === 'Omit' || parsedTarget.type === 'Partial' || parsedTarget.type === 'Overwrite') {
            output = this._readPureMappedType(parsedTarget);
        }
        else {
            throw new Error('Invalid PureMappedType child: ' + schema.type);
        }
        // filter key
        if (schema.type === 'Pick') {
            // 把Pick以外的剔除
            for (var key in output) {
                if (schema.keys.indexOf(key) === -1) {
                    delete output[key];
                }
            }
        }
        else if (schema.type === 'Omit') {
            // 剔除Omit
            for (var key in output) {
                if (schema.keys.indexOf(key) > -1) {
                    delete output[key];
                }
            }
        }
        else if (schema.type === 'Overwrite') {
            Object.assign(output, overwrite);
        }
        // Partial 原样返回
        return output;
    };
    Decoder.prototype._readNumber = function (schema) {
        // 默认为double
        var scalarType = schema.scalarType || 'double';
        switch (scalarType) {
            // 定长编码
            case 'double':
                return this._reader.readDouble();
            // Varint编码
            case 'int':
                return this._reader.readInt();
            case 'uint':
                return this._reader.readUint();
            default:
                throw new Error('Scalar type not support : ' + scalarType);
        }
    };
    Decoder.prototype._readInterface = function (schema) {
        var output = {};
        var flatSchema = this._validator.protoHelper.getFlatInterfaceSchema(schema);
        // BlockID数量
        var blockIdNum = this._reader.readUint();
        var _loop_2 = function (i) {
            // ReadBlock
            var readBlockId = this_2._reader.readUint();
            var lengthType = readBlockId & 3;
            var blockId = readBlockId >> 2;
            // indexSignature
            if (blockId === 0) {
                if (flatSchema.indexSignature) {
                    var type = flatSchema.indexSignature.type;
                    var fieldName = this_2._reader.readString();
                    this_2._skipIdLengthPrefix(this_2._validator.protoHelper.parseReference(type));
                    output[fieldName] = this_2._read(type);
                }
                // indexSignature未定义，可能是新协议，此处兼容，根据lengthType跳过
                else {
                    // skip fieldName
                    this_2._reader.skipByLengthType(LengthType.LengthDelimited);
                    // skipPayload
                    this_2._reader.skipByLengthType(lengthType);
                }
            }
            // extend block
            else if (blockId <= 9) {
                var extendId_1 = blockId - 1;
                var extend = schema.extends && schema.extends.find(function (v) { return v.id === extendId_1; });
                if (extend) {
                    this_2._skipIdLengthPrefix(this_2._validator.protoHelper.parseReference(extend.type));
                    var extendValue = this_2._read(extend.type);
                    Object.assign(output, extendValue);
                }
                // 未知的extendId 可能是新协议 跳过
                else {
                    // skipPayload
                    this_2._reader.skipByLengthType(lengthType);
                }
            }
            // property
            else {
                var propertyId_1 = blockId - 10;
                var property = schema.properties && schema.properties.find(function (v) { return v.id === propertyId_1; });
                if (property) {
                    this_2._skipIdLengthPrefix(this_2._validator.protoHelper.parseReference(property.type));
                    output[property.name] = this_2._read(property.type);
                }
                // 未知的PropertyID 可能是新协议 跳过
                else {
                    // skipPayload
                    this_2._reader.skipByLengthType(lengthType);
                }
            }
        };
        var this_2 = this;
        for (var i = 0; i < blockIdNum; ++i) {
            _loop_2();
        }
        // Literal property 由于不编码 将其补回
        // undefined as null
        for (var _i = 0, _a = flatSchema.properties; _i < _a.length; _i++) {
            var property = _a[_i];
            if (output.hasOwnProperty(property.name)) {
                continue;
            }
            // Literal
            var parsedType = this._validator.protoHelper.parseReference(property.type);
            if (parsedType.type === 'Literal') {
                output[property.name] = parsedType.literal;
                continue;
            }
            // undefined as null
            if (this._undefinedAsNull(output[property.name], parsedType, property.optional)) {
                output[property.name] = null;
                continue;
            }
        }
        return output;
    };
    /** @internal 是否该null值小于当做undefined编码 */
    Decoder.prototype._undefinedAsNull = function (value, type, isOptional) {
        return value === undefined
            && this._options.undefinedAsNull
            && !SchemaUtil.canBeLiteral(type, undefined) && !isOptional
            && SchemaUtil.canBeLiteral(type, null);
    };
    Decoder.prototype._skipIdLengthPrefix = function (parsedSchema) {
        var lengthInfo = IdBlockUtil.getPayloadLengthInfo(parsedSchema, this._validator.protoHelper);
        if (lengthInfo.needLengthPrefix) {
            // skip length prefix
            this._reader.skipByLengthType(LengthType.Varint);
        }
    };
    Decoder.prototype._readUnionOrIntersection = function (schema) {
        var output;
        var idNum = this._reader.readUint();
        var _loop_3 = function (i) {
            var readId = this_3._reader.readUint();
            var lengthType = readId & 3;
            var id = readId >> 2;
            var member = schema.members.find(function (v) { return v.id === id; });
            // 不可识别的Member，可能是新协议，跳过使兼容
            if (!member) {
                this_3._reader.skipByLengthType(lengthType);
                return "continue";
            }
            this_3._skipIdLengthPrefix(this_3._validator.protoHelper.parseReference(member.type));
            var value = this_3._read(member.type);
            if (this_3._isObject(output) && this_3._isObject(value)) {
                Object.assign(output, value);
            }
            else {
                output = value;
            }
        };
        var this_3 = this;
        for (var i = 0; i < idNum; ++i) {
            _loop_3();
        }
        if (this._undefinedAsNull(output, schema)) {
            output = null;
        }
        return output;
    };
    Decoder.prototype._isObject = function (value) {
        return typeof (value) === 'object' && value !== null;
    };
    Decoder.prototype._getBufferValue = function (uint8Arr, schema) {
        if (schema.arrayType) {
            if (schema.arrayType === 'BigInt64Array' || schema.arrayType === 'BigUint64Array') {
                throw new Error('Unsupported arrayType: ' + schema.arrayType);
            }
            // Uint8Array 性能最高
            else if (schema.arrayType === 'Uint8Array') {
                return uint8Arr;
            }
            // 其余TypedArray 可能需要内存拷贝 性能次之
            else {
                var typedArr = TypedArrays[schema.arrayType];
                // 字节对齐，可以直接转，无需拷贝内存
                if (uint8Arr.byteOffset % typedArr.BYTES_PER_ELEMENT === 0) {
                    return new typedArr(uint8Arr.buffer, uint8Arr.byteOffset, uint8Arr.byteLength / typedArr.BYTES_PER_ELEMENT);
                }
                // 字节不对齐，不能直接转，只能拷贝内存后再生成
                else {
                    var arrBuf = uint8Arr.buffer.slice(uint8Arr.byteOffset, uint8Arr.byteOffset + uint8Arr.byteLength);
                    return new typedArr(arrBuf);
                }
            }
        }
        else {
            return uint8Arr.byteLength === uint8Arr.buffer.byteLength && uint8Arr.byteOffset === 0 ? uint8Arr.buffer
                : uint8Arr.buffer.slice(uint8Arr.byteOffset, uint8Arr.byteOffset + uint8Arr.byteLength);
        }
    };
    return Decoder;
}());

/** @internal */
var Config = {
    interface: {
        maxExtendsNum: 9
    }
};

/**
 * 用Op来串联 next
 * Op包含 function next length
 * 先度量长度再执行编码
 * 一次性编码
 * 使用BufferPool
 * writer.uint32(xx).string(xxx).finish();
 * @internal
 */
var BufferWriter = /** @class */ (function () {
    function BufferWriter() {
        this._ops = [];
    }
    Object.defineProperty(BufferWriter.prototype, "ops", {
        get: function () {
            return this._ops;
        },
        enumerable: false,
        configurable: true
    });
    BufferWriter.prototype.clear = function () {
        this._ops = [];
    };
    BufferWriter.prototype.push = function (req) {
        this._ops.push(this.req2op(req));
        return this;
    };
    BufferWriter.prototype.req2op = function (req) {
        if (req.type === 'string' || req.type === 'buffer') {
            var valueLength = this.measureLength(req);
            // Length
            this.push({ type: 'varint', value: Varint64.from(valueLength) });
            // Value
            return tslib.__assign(tslib.__assign({}, req), { length: valueLength });
        }
        else {
            var length_1 = this.measureLength(req);
            return tslib.__assign(tslib.__assign({}, req), { length: length_1 });
        }
    };
    BufferWriter.prototype.measureLength = function (req) {
        switch (req.type) {
            case 'varint':
                return req.value.byteLength;
            case 'string':
                return Utf8Coder.measureLength(req.value);
            case 'buffer':
                return req.value.byteLength;
            case 'double':
                return 8;
            case 'boolean':
                return 1;
            default:
                return NaN;
        }
    };
    BufferWriter.prototype.finish = function () {
        var byteLength = this._ops.sum(function (v) { return v.length; });
        var pos = 0;
        var buf = new Uint8Array(byteLength);
        var view = new DataView(buf.buffer);
        for (var _i = 0, _a = this._ops; _i < _a.length; _i++) {
            var op = _a[_i];
            switch (op.type) {
                case 'varint':
                    var newPos = op.value.writeToBuffer(buf, pos);
                    if (newPos !== pos + op.length) {
                        throw new Error("Error varint measuredLength ".concat(op.length, ", actual is ").concat(newPos - pos, ", value is ").concat(op.value.toNumber()));
                    }
                    break;
                case 'double':
                    view.setFloat64(buf.byteOffset + pos, op.value);
                    break;
                case 'string':
                    var encLen = Utf8Coder.write(op.value, buf, pos);
                    if (encLen !== op.length) {
                        throw new Error("Expect ".concat(op.length, " bytes but encoded ").concat(encLen, " bytes"));
                    }
                    break;
                case 'buffer':
                    buf.subarray(pos, pos + op.length).set(op.value);
                    break;
                case 'boolean':
                    view.setUint8(buf.byteOffset + pos, op.value ? 255 : 0);
                    break;
            }
            pos += op.length;
        }
        return buf;
    };
    return BufferWriter;
}());

/** @internal */
var Encoder = /** @class */ (function () {
    function Encoder(options) {
        this._options = options;
        this._writer = new BufferWriter();
        this._validator = options.validator;
    }
    Encoder.prototype.encode = function (value, schema) {
        this._writer.clear();
        this._write(value, schema);
        return this._writer.finish();
    };
    Encoder.prototype.encodeJSON = function (value, schema) {
        var _this = this;
        // JSON 能直接传输的类型，直接跳过
        if (typeof value !== 'object' || value === null || CoderUtil.isJsonCompatible(schema, 'encode', this._validator.protoHelper)) {
            return value;
        }
        switch (schema.type) {
            case tsbufferSchema.SchemaType.Array:
                if (!Array.isArray(value)) {
                    break;
                }
                return value.map(function (v) { return _this.encodeJSON(v, schema.elementType); });
            case tsbufferSchema.SchemaType.Tuple: {
                if (!Array.isArray(value)) {
                    break;
                }
                return value.map(function (v, i) { return _this.encodeJSON(v, schema.elementTypes[i]); });
            }
            case tsbufferSchema.SchemaType.Interface: {
                if (value.constructor !== Object) {
                    break;
                }
                value = Object.assign({}, value);
                var flatSchema = this._validator.protoHelper.getFlatInterfaceSchema(schema);
                var _loop_1 = function (key) {
                    var property = flatSchema.properties.find(function (v) { return v.name === key; });
                    if (property) {
                        value[key] = this_1.encodeJSON(value[key], property.type);
                    }
                    else if (flatSchema.indexSignature) {
                        value[key] = this_1.encodeJSON(value[key], flatSchema.indexSignature.type);
                    }
                };
                var this_1 = this;
                for (var key in value) {
                    _loop_1(key);
                }
                return value;
            }
            case tsbufferSchema.SchemaType.Partial:
            case tsbufferSchema.SchemaType.Pick:
            case tsbufferSchema.SchemaType.Omit:
            case tsbufferSchema.SchemaType.Overwrite:
                var parsed = this._validator.protoHelper.parseMappedType(schema);
                return this.encodeJSON(value, parsed);
            case tsbufferSchema.SchemaType.Buffer:
                if (!(value instanceof ArrayBuffer) && !ArrayBuffer.isView(value)) {
                    break;
                }
                if (schema.arrayType) {
                    if (schema.arrayType === 'Uint8Array') {
                        return Base64Util.bufferToBase64(value);
                    }
                    var view = value;
                    var buf = view.byteLength === view.buffer.byteLength && view.byteOffset === 0 ? view.buffer
                        : view.buffer.slice(view.byteOffset, view.byteOffset + view.byteLength);
                    return Base64Util.bufferToBase64(new Uint8Array(buf));
                }
                else {
                    return Base64Util.bufferToBase64(new Uint8Array(value));
                }
            case tsbufferSchema.SchemaType.IndexedAccess:
            case tsbufferSchema.SchemaType.Reference:
            case tsbufferSchema.SchemaType.Keyof:
                return this.encodeJSON(value, this._validator.protoHelper.parseReference(schema));
            case tsbufferSchema.SchemaType.Union:
            case tsbufferSchema.SchemaType.Intersection: {
                // 逐个编码 然后合并 （失败的会原值返回，所以不影响结果）
                for (var _i = 0, _a = schema.members; _i < _a.length; _i++) {
                    var member = _a[_i];
                    value = this.encodeJSON(value, member.type);
                }
                return value;
            }
            case tsbufferSchema.SchemaType.NonNullable:
                return this.encodeJSON(value, schema.target);
            case tsbufferSchema.SchemaType.Date:
                if (!(value instanceof Date)) {
                    break;
                }
                return value.toJSON();
            case tsbufferSchema.SchemaType.Custom:
                if (schema.encodeJSON) {
                    return schema.encodeJSON(value);
                }
                else if (typeof (value === null || value === void 0 ? void 0 : value.toJSON) === 'function') {
                    return value.toJSON();
                }
                else if (typeof (value === null || value === void 0 ? void 0 : value.toString) === 'function') {
                    return value.toString();
                }
                return value;
            default:
                schema.type;
        }
        return value;
    };
    Encoder.prototype._write = function (value, schema, options) {
        switch (schema.type) {
            case tsbufferSchema.SchemaType.Boolean:
                this._writer.push({ type: 'boolean', value: value });
                break;
            case tsbufferSchema.SchemaType.Number:
                this._writeNumber(value, schema);
                break;
            case tsbufferSchema.SchemaType.String:
                this._writer.push({ type: 'string', value: value });
                break;
            case tsbufferSchema.SchemaType.Array: {
                var _v = value;
                // 数组长度：Varint
                this._writer.push({ type: 'varint', value: Varint64.from(_v.length) });
                // Element Payload
                for (var i = 0; i < _v.length; ++i) {
                    this._write(_v[i], schema.elementType);
                }
                break;
            }
            case tsbufferSchema.SchemaType.Tuple: {
                if (schema.elementTypes.length > 64) {
                    throw new Error('Elements oversized, maximum supported tuple elements is 64, now get ' + schema.elementTypes.length);
                }
                var _v = value;
                // 计算maskPos（要编码的值的index）
                var maskIndices = [];
                for (var i = 0; i < _v.length; ++i) {
                    // undefined 不编码
                    // null as undefined
                    if (_v[i] === undefined || this._nullAsUndefined(_v[i], schema.elementTypes[i])) {
                        continue;
                    }
                    maskIndices.push(i);
                }
                // 生成PayloadMask：Varint64
                var lo = 0;
                var hi = 0;
                for (var _i = 0, maskIndices_1 = maskIndices; _i < maskIndices_1.length; _i++) {
                    var v = maskIndices_1[_i];
                    if (v < 32) {
                        lo |= 1 << v;
                    }
                    else {
                        hi |= 1 << v - 32;
                    }
                }
                this._writer.push({ type: 'varint', value: new Varint64(hi, lo) });
                // Element Payload
                for (var _a = 0, maskIndices_2 = maskIndices; _a < maskIndices_2.length; _a++) {
                    var i = maskIndices_2[_a];
                    this._write(_v[i], schema.elementTypes[i]);
                }
                break;
            }
            case tsbufferSchema.SchemaType.Enum:
                var enumItem = schema.members.find(function (v) { return v.value === value; });
                if (!enumItem) {
                    throw new Error("Unexpect enum value: ".concat(value));
                }
                this._writer.push({ type: 'varint', value: Varint64.from(enumItem.id) });
                break;
            case tsbufferSchema.SchemaType.Any:
                if (value === undefined) {
                    this._writer.push({ type: 'string', value: 'undefined' });
                }
                else {
                    this._writer.push({ type: 'string', value: JSON.stringify(value) });
                }
                break;
            case tsbufferSchema.SchemaType.Object:
                this._writer.push({ type: 'string', value: JSON.stringify(value) });
                break;
            case tsbufferSchema.SchemaType.Literal:
                break;
            case tsbufferSchema.SchemaType.Interface:
                this._writeInterface(value, schema, options);
                break;
            case tsbufferSchema.SchemaType.Buffer:
                this._writeBuffer(value);
                break;
            case tsbufferSchema.SchemaType.IndexedAccess:
            case tsbufferSchema.SchemaType.Reference:
            case tsbufferSchema.SchemaType.Keyof:
                this._write(value, this._validator.protoHelper.parseReference(schema), options);
                break;
            case tsbufferSchema.SchemaType.Partial:
            case tsbufferSchema.SchemaType.Pick:
            case tsbufferSchema.SchemaType.Omit:
            case tsbufferSchema.SchemaType.Overwrite:
                var parsed = this._validator.protoHelper.parseMappedType(schema);
                if (parsed.type === tsbufferSchema.SchemaType.Interface) {
                    this._writePureMappedType(value, schema, options);
                }
                else if (parsed.type === tsbufferSchema.SchemaType.Union) {
                    this._writeUnion(value, parsed, options === null || options === void 0 ? void 0 : options.skipFields);
                }
                else if (parsed.type === tsbufferSchema.SchemaType.Intersection) {
                    this._writeIntersection(value, parsed, options === null || options === void 0 ? void 0 : options.skipFields);
                }
                break;
            case tsbufferSchema.SchemaType.Union:
                this._writeUnion(value, schema, options === null || options === void 0 ? void 0 : options.skipFields);
                break;
            case tsbufferSchema.SchemaType.Intersection:
                this._writeIntersection(value, schema, options === null || options === void 0 ? void 0 : options.skipFields);
                break;
            case tsbufferSchema.SchemaType.Date:
                this._writer.push({ type: 'varint', value: Varint64.from(value.getTime()) });
                break;
            case tsbufferSchema.SchemaType.NonNullable:
                this._write(value, schema.target, options);
                break;
            case tsbufferSchema.SchemaType.Custom:
                if (!schema.encode) {
                    throw new Error('Missing encode method for CustomTypeSchema');
                }
                var buf = schema.encode(value);
                // 以 Buffer 形式写入
                this._writeBuffer(buf);
                break;
            default:
                // @ts-expect-error
                throw new Error("Unrecognized schema type: ".concat(schema.type));
        }
    };
    Encoder.prototype._writePureMappedType = function (value, schema, options) {
        if (!options) {
            options = {};
        }
        if (schema.type === 'Pick') {
            // 已存在 取交集
            if (options.pickFields) {
                var newPickFields = {};
                for (var _i = 0, _a = schema.keys; _i < _a.length; _i++) {
                    var v = _a[_i];
                    if (options.pickFields[v]) {
                        newPickFields[v] = 1;
                    }
                }
                options.pickFields = newPickFields;
            }
            // 不存在 初始化
            else {
                options.pickFields = {};
                for (var _b = 0, _c = schema.keys; _b < _c.length; _b++) {
                    var v = _c[_b];
                    options.pickFields[v] = 1;
                }
            }
        }
        else if (schema.type === 'Omit') {
            // 不存在 初始化
            if (!(options === null || options === void 0 ? void 0 : options.skipFields)) {
                if (!options) {
                    options = {};
                }
                options.skipFields = {};
            }
            // 取并集                
            for (var _d = 0, _e = schema.keys; _d < _e.length; _d++) {
                var v = _e[_d];
                options.skipFields[v] = 1;
            }
        }
        else if (schema.type === 'Overwrite') {
            var parsed = this._parseOverwrite(value, schema);
            // 写入Overwrite部分
            this._write(parsed.overwriteValue, parsed.overwrite, options);
        }
        else if (schema.type === 'Partial') ;
        else {
            // @ts-expect-error
            throw new Error('Invalid PureMappedType child: ' + schema.type);
        }
        // Write Interface
        var parsedTarget = this._validator.protoHelper.parseReference(schema.target);
        if (parsedTarget.type === 'Interface') {
            this._writeInterface(value, parsedTarget, options);
        }
        else {
            this._writePureMappedType(value, parsedTarget, options);
        }
    };
    Encoder.prototype._writeNumber = function (value, schema) {
        // 默认为double
        var scalarType = schema.scalarType || 'double';
        switch (scalarType) {
            // 定长编码
            case 'double':
                this._writer.push({ type: scalarType, value: value });
                break;
            // Varint编码
            case 'int':
                this._writer.push({ type: 'varint', value: Varint64.from(value).zzEncode() });
                break;
            case 'uint':
                this._writer.push({ type: 'varint', value: Varint64.from(value) });
                break;
            default:
                throw new Error('Scalar type not support : ' + scalarType);
        }
    };
    Encoder.prototype._writeInterface = function (value, schema, options) {
        // skipFields默认值
        if (!options) {
            options = {};
        }
        if (!options.skipFields) {
            options.skipFields = {};
        }
        // 记录起始op位置，用于最后插入BlockID数量
        var opStartOps = this._writer.ops.length;
        var blockIdCount = 0;
        // 以下，interface
        // extends
        if (schema.extends) {
            // 支持的继承数量有上限
            if (schema.extends.length > Config.interface.maxExtendsNum) {
                throw new Error("Max support ".concat(Config.interface.maxExtendsNum, " extends, actual: ").concat(schema.extends.length));
            }
            for (var _i = 0, _a = schema.extends; _i < _a.length; _i++) {
                var extend = _a[_i];
                // BlockID = extend.id + 1
                var blockId = extend.id + 1;
                this._writer.push({ type: 'varint', value: Varint64.from(blockId) });
                var blockIdPos = this._writer.ops.length - 1;
                // 写入extend interface前 writeOps的长度
                var opsLengthBeforeWrite = this._writer.ops.length;
                // extend Block
                var parsedExtend = this._validator.protoHelper.parseReference(extend.type);
                this._writeInterface(value, parsedExtend, tslib.__assign(tslib.__assign({}, options), { 
                    // 确保indexSignature是在最小层级编码
                    skipIndexSignature: !!schema.indexSignature || options.skipIndexSignature // 如果父级有indexSignature 或 父级跳过 则跳过indexSignature
                 }));
                // 写入前后writeOps只增加了一个（block length），说明该extend并未写入任何property字段，取消编码这个block
                if (this._writer.ops.length === opsLengthBeforeWrite + 1) {
                    // 移除BlockID
                    this._writer.ops.splice(this._writer.ops.length - 2, 2);
                }
                // extend写入成功 blockId数量+1
                else {
                    ++blockIdCount;
                    this._processIdWithLengthType(blockIdPos, extend.type);
                }
            }
        }
        // property
        if (schema.properties) {
            for (var _b = 0, _c = schema.properties; _b < _c.length; _b++) {
                var property = _c[_b];
                var parsedType = this._validator.protoHelper.parseReference(property.type);
                var propValue = value[property.name];
                // PickFields
                if (options.pickFields && !options.pickFields[property.name]) {
                    continue;
                }
                // Literal不编码 直接跳过
                if (parsedType.type === 'Literal') {
                    options.skipFields[property.name] = 1;
                    continue;
                }
                // null as undefined
                if (this._nullAsUndefined(propValue, property.type)) {
                    propValue = undefined;
                }
                // undefined不编码
                if (propValue === undefined) {
                    continue;
                }
                // SkipFields
                if (options.skipFields[property.name]) {
                    continue;
                }
                options.skipFields[property.name] = 1;
                var blockId = property.id + Config.interface.maxExtendsNum + 1;
                // BlockID (propertyID)
                this._writer.push({ type: 'varint', value: Varint64.from(blockId) });
                var blockIdPos = this._writer.ops.length - 1;
                // Value Payload
                this._write(propValue, parsedType);
                ++blockIdCount;
                this._processIdWithLengthType(blockIdPos, parsedType);
            }
        }
        // indexSignature
        if (!options.skipIndexSignature) {
            var flat = this._validator.protoHelper.getFlatInterfaceSchema(schema);
            if (flat.indexSignature) {
                for (var key in value) {
                    if (value[key] === undefined || this._nullAsUndefined(value[key], flat.indexSignature.type)) {
                        continue;
                    }
                    // PickFields
                    if (options.pickFields && !options.pickFields[key]) {
                        continue;
                    }
                    // SkipFields
                    if (options.skipFields[key]) {
                        continue;
                    }
                    options.skipFields[key] = 1;
                    // BlockID == 0
                    this._writer.push({ type: 'varint', value: Varint64.from(0) });
                    var blockIdPos = this._writer.ops.length - 1;
                    // 字段名
                    this._writer.push({ type: 'string', value: key });
                    var lengthPrefixPos = this._writer.ops.length;
                    // Value Payload
                    this._write(value[key], flat.indexSignature.type);
                    ++blockIdCount;
                    this._processIdWithLengthType(blockIdPos, flat.indexSignature.type, lengthPrefixPos);
                }
            }
        }
        this._writer.ops.splice(opStartOps, 0, this._writer.req2op({ type: 'varint', value: Varint64.from(blockIdCount) }));
    };
    /** @internal 是否该null值小于当做undefined编码 */
    Encoder.prototype._nullAsUndefined = function (value, type) {
        return value === null
            && this._options.nullAsUndefined
            && !SchemaUtil.canBeLiteral(type, null);
        // && SchemaUtil.canBeLiteral(type, undefined)  一定为true 因为先validate过了
    };
    Encoder.prototype._parseOverwrite = function (value, schema) {
        var skipFields = {};
        // 解引用
        var target = this._validator.protoHelper.parseReference(schema.target);
        var overwrite = this._validator.protoHelper.parseReference(schema.overwrite);
        var flatTarget = this._validator.protoHelper.getFlatInterfaceSchema(target);
        var flatOverwrite = this._validator.protoHelper.getFlatInterfaceSchema(overwrite);
        // 先区分哪些字段进入Target块，哪些字段进入Overwrite块
        var overwriteValue = {};
        var targetValue = {};
        // Overwrite块 property
        if (flatOverwrite.properties) {
            // 只要Overwrite中有此Property，即在Overwrite块编码
            for (var _i = 0, _a = flatOverwrite.properties; _i < _a.length; _i++) {
                var property = _a[_i];
                // undefined不编码，跳过SkipFIelds
                if (value[property.name] !== undefined && !skipFields[property.name]) {
                    overwriteValue[property.name] = value[property.name];
                    skipFields[property.name] = 1;
                }
            }
        }
        // Target块 property
        if (flatTarget.properties) {
            for (var _b = 0, _c = flatTarget.properties; _b < _c.length; _b++) {
                var property = _c[_b];
                // undefined不编码，跳过SkipFields
                if (value[property.name] !== undefined && !skipFields[property.name]) {
                    targetValue[property.name] = value[property.name];
                    skipFields[property.name] = 1;
                }
            }
        }
        // indexSignature
        var indexSignatureWriteValue; // indexSignature要写入的目标（overwrite或target）
        var indexSignature;
        // IndexSignature，优先使用Overwrite的
        if (flatOverwrite.indexSignature) {
            indexSignature = flatOverwrite.indexSignature;
            indexSignatureWriteValue = overwriteValue;
        }
        else if (flatTarget.indexSignature) {
            indexSignature = flatTarget.indexSignature;
            indexSignatureWriteValue = targetValue;
        }
        if (indexSignature) {
            for (var key in value) {
                if (skipFields[key]) {
                    continue;
                }
                indexSignatureWriteValue[key] = value[key];
                skipFields[key] = 1;
            }
        }
        // 编码，此处不再需要SkipFields，因为已经筛选过
        return {
            target: target,
            targetValue: targetValue,
            overwrite: overwrite,
            overwriteValue: overwriteValue
        };
    };
    Encoder.prototype._writeUnion = function (value, schema, skipFields, unionProperties) {
        // 计算unionProperties
        // if (!unionProperties) {
        //     unionProperties = skipFields ? Object.keys(skipFields) : [];
        // }
        // this._validator.protoHelper.getUnionProperties(schema).forEach(v => {
        //     unionProperties!.binaryInsert(v, true);
        // })
        if (skipFields === void 0) { skipFields = {}; }
        // 记住编码起点
        var encodeStartPos = this._writer.ops.length;
        var idNum = 0;
        // null as undefined
        if (this._nullAsUndefined(value, schema)) {
            value = undefined;
        }
        for (var _i = 0, _a = schema.members; _i < _a.length; _i++) {
            var member = _a[_i];
            // 验证该member是否可以编码            
            var vRes = this._validator.validate(value, member.type, {
                // 禁用excessPropertyChecks（以代替unionProperties）
                excessPropertyChecks: false,
                // 启用strictNullChecks（null as undefined已经前置处理）
                // strictNullChecks: true
            });
            if (vRes.isSucc) {
                // 编码
                // Part2: ID
                this._writer.push({ type: 'varint', value: Varint64.from(member.id) });
                var idPos = this._writer.ops.length - 1;
                // Part3: Payload
                if (member.type.type === 'Union') {
                    this._writeUnion(value, member.type, skipFields);
                }
                else {
                    this._write(value, member.type, {
                        skipFields: skipFields
                    });
                }
                idNum++;
                this._processIdWithLengthType(idPos, member.type);
                // 非object的value，类型一定互斥，只编码一个足矣
                if (typeof value !== 'object') {
                    break;
                }
            }
        }
        // 已经编码
        if (idNum > 0) {
            // 前置ID数量
            this._writer.ops.splice(encodeStartPos, 0, this._writer.req2op({ type: 'varint', value: Varint64.from(idNum) }));
            return;
        }
        else {
            // 未编码，没有任何条件满足，抛出异常
            throw new Error('Non member is satisfied for union type');
        }
    };
    Encoder.prototype._writeIntersection = function (value, schema, skipFields) {
        if (skipFields === void 0) { skipFields = {}; }
        // ID数量（member数量）
        this._writer.push({ type: 'varint', value: Varint64.from(schema.members.length) });
        // 按Member依次编码
        for (var _i = 0, _a = schema.members; _i < _a.length; _i++) {
            var member = _a[_i];
            // ID
            this._writer.push({ type: 'varint', value: Varint64.from(member.id) });
            var idPos = this._writer.ops.length - 1;
            // 编码块
            this._write(value, member.type, {
                skipFields: skipFields
            });
            this._processIdWithLengthType(idPos, member.type);
        }
    };
    Encoder.prototype._writeBuffer = function (value) {
        // ArrayBuffer 转为Uint8Array
        if (value instanceof ArrayBuffer) {
            this._writer.push({ type: 'buffer', value: new Uint8Array(value) });
        }
        // Uint8Array 直接写入
        else if (value instanceof Uint8Array) {
            this._writer.push({ type: 'buffer', value: value });
        }
        // 其它TypedArray 转为Uint8Array
        else {
            var key = value.constructor.name;
            var arrType = TypedArrays[key];
            var uint8Arr = new Uint8Array(value.buffer, value.byteOffset, value.length * arrType.BYTES_PER_ELEMENT);
            this._writer.push({ type: 'buffer', value: uint8Arr });
        }
    };
    // private _writeIdBlocks(blocks: IDBlockItem[]) {
    //     // 字段数量: Varint
    //     this._writer.push({ type: 'varint', value: Varint64.from(blocks.length) });
    //     // 依次编码
    //     for (let item of blocks) {
    //         // ID
    //         this._writer.push({ type: 'varint', value: Varint64.from(item.id) });
    //         // Payload
    //         this._write(item.value, item.schema)
    //     }
    // }
    /**
     * 重新处理ID位，使其加入末位长度信息2Bit
     * @param idPos
     */
    Encoder.prototype._processIdWithLengthType = function (idPos, payloadType, lengthPrefixPos) {
        var idOp = this._writer.ops[idPos];
        if (idOp.type !== 'varint') {
            throw new Error('Error idPos: ' + idPos);
        }
        // 解引用
        var parsedSchema = this._validator.protoHelper.parseReference(payloadType);
        var lengthInfo = IdBlockUtil.getPayloadLengthInfo(parsedSchema, this._validator.protoHelper);
        var newId = (idOp.value.toNumber() << 2) + lengthInfo.lengthType;
        this._writer.ops[idPos] = this._writer.req2op({
            type: 'varint',
            value: Varint64.from(newId)
        });
        if (lengthInfo.needLengthPrefix) {
            var payloadByteLength = this._writer.ops.filter(function (v, i) { return i > idPos; }).sum(function (v) { return v.length; });
            this._writer.ops.splice(lengthPrefixPos == undefined ? idPos + 1 : lengthPrefixPos, 0, this._writer.req2op({
                type: 'varint',
                value: Varint64.from(payloadByteLength)
            }));
        }
    };
    return Encoder;
}());

/**
 * @public
 */
var TSBuffer = /** @class */ (function () {
    function TSBuffer(proto, options) {
        /** @internal 默认配置 */
        this._options = {
            excessPropertyChecks: true,
            strictNullChecks: false,
            skipEncodeValidate: false,
            skipDecodeValidate: false,
            cloneProto: true,
        };
        // but `options.validatorOptions` has higher priority to validate process (don't affect encode)
        this._options = tslib.__assign(tslib.__assign({}, this._options), options);
        this._proto = this._options.cloneProto ? Object.merge({}, proto) : proto;
        Object.assign(this._proto, Object.merge({}, options === null || options === void 0 ? void 0 : options.customTypes));
        this._validator = new tsbufferValidator.TSBufferValidator(this._proto, {
            excessPropertyChecks: this._options.excessPropertyChecks,
            strictNullChecks: this._options.strictNullChecks,
            cloneProto: false
        });
        this.validate = this._validator.validate.bind(this._validator);
        this.prune = this._validator.prune.bind(this._validator);
        this._encoder = new Encoder({
            validator: this._validator,
            // if !strictNullChecks, then encoder can convert null to undefined
            nullAsUndefined: !this._options.strictNullChecks
        });
        this._decoder = new Decoder({
            validator: this._validator,
            // if !strictNullChecks, then decoder can convert undefined to null
            undefinedAsNull: !this._options.strictNullChecks
        });
    }
    /**
     * 编码
     * @param value - 要编码的值
     * @param schemaOrId - Schema 或 SchemaID，例如`a/b.ts`下的`Test`类型，其ID为`a/b/Test`
     */
    TSBuffer.prototype.encode = function (value, schemaOrId, options) {
        var _a;
        var schema;
        if (typeof schemaOrId === 'string') {
            schema = this._proto[schemaOrId];
            if (!schema) {
                return { isSucc: false, errMsg: "Cannot find schema\uFF1A ".concat(schemaOrId) };
            }
        }
        else {
            schema = schemaOrId;
        }
        // validate before encode
        if (!((_a = options === null || options === void 0 ? void 0 : options.skipValidate) !== null && _a !== void 0 ? _a : this._options.skipEncodeValidate)) {
            var vRes = this._validator.validate(value, schema, {
                // 禁用excessPropertyChecks，因为不会编码excess property
                excessPropertyChecks: false
            });
            if (!vRes.isSucc) {
                return vRes;
            }
        }
        var buf;
        try {
            buf = this._encoder.encode(value, schema);
        }
        catch (e) {
            return { isSucc: false, errMsg: e.message };
        }
        return { isSucc: true, buf: buf };
    };
    /**
     * 解码
     * @param buf - 待解码的二进制数据
     * @param schemaOrId - Schema 或 SchemaID，例如`a/b.ts`下的`Test`类型，其ID为`a/b/Test`
     */
    TSBuffer.prototype.decode = function (buf, schemaOrId, options) {
        var _a;
        var schema;
        if (typeof schemaOrId === 'string') {
            schema = this._proto[schemaOrId];
            if (!schema) {
                return { isSucc: false, errMsg: "Cannot find schema\uFF1A ".concat(schemaOrId), errPhase: undefined };
            }
        }
        else {
            schema = schemaOrId;
        }
        var value;
        try {
            value = this._decoder.decode(buf, schema);
        }
        catch (e) {
            return { isSucc: false, errMsg: e.message, errPhase: 'decode' };
        }
        if (!((_a = options === null || options === void 0 ? void 0 : options.skipValidate) !== null && _a !== void 0 ? _a : this._options.skipDecodeValidate)) {
            var vRes = this._validator.validate(value, schema);
            if (!vRes.isSucc) {
                return tslib.__assign(tslib.__assign({}, vRes), { errPhase: 'validate' });
            }
        }
        return { isSucc: true, value: value };
    };
    /**
     * 编码为 JSON Object，根据协议将 JSON 不支持的格式（如 ArrayBuffer、Date、ObjectId）转换成 JSON 可传输的格式
     * @param value
     * @param schemaOrId
     * @param options
     */
    TSBuffer.prototype.encodeJSON = function (value, schemaOrId, options) {
        var _a;
        var schema;
        if (typeof schemaOrId === 'string') {
            schema = this._proto[schemaOrId];
            if (!schema) {
                return { isSucc: false, errMsg: "Cannot find schema\uFF1A ".concat(schemaOrId) };
            }
        }
        else {
            schema = schemaOrId;
        }
        // validate before encode
        if (!((_a = options === null || options === void 0 ? void 0 : options.skipValidate) !== null && _a !== void 0 ? _a : this._options.skipEncodeValidate)) {
            var vRes = this._validator.prune(value, schema);
            if (!vRes.isSucc) {
                return vRes;
            }
            value = vRes.pruneOutput;
        }
        // TODO schema 里没有 Buffer 和 Custom 的自动跳过
        var json;
        try {
            json = this._encoder.encodeJSON(value, schema);
        }
        catch (e) {
            return { isSucc: false, errMsg: e.message };
        }
        return { isSucc: true, json: json };
    };
    /**
     * 从 JSON Object 解码，根据协议将 ArrayBuffer、Date、ObjectId 等类型从 JSON 中还原
     * @param json - JSON Object (是 JSON 对象，而非 JSON 字符串)
     * @param schemaOrId
     * @param options
     */
    TSBuffer.prototype.decodeJSON = function (json, schemaOrId, options) {
        var _a;
        var schema;
        if (typeof schemaOrId === 'string') {
            schema = this._proto[schemaOrId];
            if (!schema) {
                return { isSucc: false, errMsg: "Cannot find schema\uFF1A ".concat(schemaOrId), errPhase: undefined };
            }
        }
        else {
            schema = schemaOrId;
        }
        // TODO schema 里没有 Buffer 和 Custom 的自动跳过
        var value;
        try {
            value = this._decoder.decodeJSON(json, schema);
        }
        catch (e) {
            return { isSucc: false, errMsg: e.message, errPhase: 'decode' };
        }
        if (!((_a = options === null || options === void 0 ? void 0 : options.skipValidate) !== null && _a !== void 0 ? _a : this._options.skipDecodeValidate)) {
            var vRes = this._validator.prune(value, schema);
            if (!vRes.isSucc) {
                vRes.errPhase = 'validate';
                return vRes;
            }
            return { isSucc: true, value: vRes.pruneOutput };
        }
        return { isSucc: true, value: value };
    };
    return TSBuffer;
}());

exports.Base64Util = Base64Util;
exports.TSBuffer = TSBuffer;

}, function(modId) {var map = {}; return __REQUIRE__(map[modId], modId); })
return __REQUIRE__(1667821180095);
})()
//miniprogram-npm-outsideDeps=["k8w-extend-native","tslib","tsbuffer-validator","tsbuffer-schema"]
//# sourceMappingURL=index.js.map