module.exports = (function() {
var __MODS__ = {};
var __DEFINE__ = function(modId, func, req) { var m = { exports: {}, _tempexports: {} }; __MODS__[modId] = { status: 0, func: func, req: req, m: m }; };
var __REQUIRE__ = function(modId, source) { if(!__MODS__[modId]) return require(source); if(!__MODS__[modId].status) { var m = __MODS__[modId].m; m._exports = m._tempexports; var desp = Object.getOwnPropertyDescriptor(m, "exports"); if (desp && desp.configurable) Object.defineProperty(m, "exports", { set: function (val) { if(typeof val === "object" && val !== m._exports) { m._exports.__proto__ = val.__proto__; Object.keys(val).forEach(function (k) { m._exports[k] = val[k]; }); } m._tempexports = val }, get: function () { return m._tempexports; } }); __MODS__[modId].status = 1; __MODS__[modId].func(__MODS__[modId].req, m, m.exports); } return __MODS__[modId].m.exports; };
var __REQUIRE_WILDCARD__ = function(obj) { if(obj && obj.__esModule) { return obj; } else { var newObj = {}; if(obj != null) { for(var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) newObj[k] = obj[k]; } } newObj.default = obj; return newObj; } };
var __REQUIRE_DEFAULT__ = function(obj) { return obj && obj.__esModule ? obj.default : obj; };
__DEFINE__(1667821180094, function(require, module, exports) {
/*!
 * TSBuffer Validator v2.1.1
 * -----------------------------------------
 * MIT LICENSE
 * KingWorks (C) Copyright 2022
 * https://github.com/k8w/tsbuffer-validator
 */


Object.defineProperty(exports, '__esModule', { value: true });

require('k8w-extend-native');
var tslib = require('tslib');
var tsbufferSchema = require('tsbuffer-schema');

var ProtoHelper = /** @class */ (function () {
    function ProtoHelper(proto) {
        this._schemaWithUuids = [];
        this._unionPropertiesCache = {};
        this._flatInterfaceSchemaCache = {};
        this.proto = proto;
    }
    /** 将ReferenceTypeSchema层层转换为它最终实际引用的类型 */
    ProtoHelper.prototype.parseReference = function (schema) {
        // Reference
        if (schema.type === tsbufferSchema.SchemaType.Reference) {
            var parsedSchema = this.proto[schema.target];
            if (!parsedSchema) {
                throw new Error("Cannot find reference target: ".concat(schema.target));
            }
            if (this.isTypeReference(parsedSchema)) {
                return this.parseReference(parsedSchema);
            }
            else {
                return parsedSchema;
            }
        }
        // IndexedAccess
        else if (schema.type === tsbufferSchema.SchemaType.IndexedAccess) {
            if (!this.isInterface(schema.objectType)) {
                throw new Error("Error objectType: ".concat(schema.objectType.type));
            }
            // find prop item
            var flat = this.getFlatInterfaceSchema(schema.objectType);
            var propItem = flat.properties.find(function (v) { return v.name === schema.index; });
            var propType = void 0;
            if (propItem) {
                propType = propItem.type;
            }
            else {
                if (flat.indexSignature) {
                    propType = flat.indexSignature.type;
                }
                else {
                    throw new Error("Error index: ".concat(schema.index));
                }
            }
            // optional -> | undefined
            if (propItem && propItem.optional && // 引用的字段是optional
                (propItem.type.type !== tsbufferSchema.SchemaType.Union // 自身不为Union
                    // 或自身为Union，但没有undefined成员条件
                    || propItem.type.members.findIndex(function (v) { return v.type.type === tsbufferSchema.SchemaType.Literal && v.type.literal === undefined; }) === -1)) {
                propType = {
                    type: tsbufferSchema.SchemaType.Union,
                    members: [
                        { id: 0, type: propType },
                        {
                            id: 1,
                            type: {
                                type: tsbufferSchema.SchemaType.Literal,
                                literal: undefined
                            }
                        }
                    ]
                };
            }
            return this.isTypeReference(propType) ? this.parseReference(propType) : propType;
        }
        else if (schema.type === tsbufferSchema.SchemaType.Keyof) {
            var flatInterface = this.getFlatInterfaceSchema(schema.target);
            return {
                type: tsbufferSchema.SchemaType.Union,
                members: flatInterface.properties.map(function (v, i) { return ({
                    id: i,
                    type: {
                        type: tsbufferSchema.SchemaType.Literal,
                        literal: v.name
                    }
                }); })
            };
        }
        else {
            return schema;
        }
    };
    ProtoHelper.prototype.isInterface = function (schema, excludeReference) {
        if (excludeReference === void 0) { excludeReference = false; }
        if (!excludeReference && this.isTypeReference(schema)) {
            var parsed = this.parseReference(schema);
            return this.isInterface(parsed, excludeReference);
        }
        else {
            return schema.type === tsbufferSchema.SchemaType.Interface || this.isMappedType(schema) && this.parseMappedType(schema).type === tsbufferSchema.SchemaType.Interface;
        }
    };
    ProtoHelper.prototype.isMappedType = function (schema) {
        return schema.type === tsbufferSchema.SchemaType.Pick ||
            schema.type === tsbufferSchema.SchemaType.Partial ||
            schema.type === tsbufferSchema.SchemaType.Omit ||
            schema.type === tsbufferSchema.SchemaType.Overwrite;
    };
    ProtoHelper.prototype.isTypeReference = function (schema) {
        return schema.type === tsbufferSchema.SchemaType.Reference || schema.type === tsbufferSchema.SchemaType.IndexedAccess || schema.type === tsbufferSchema.SchemaType.Keyof;
    };
    ProtoHelper.prototype._getSchemaUuid = function (schema) {
        var schemaWithUuid = schema;
        if (!schemaWithUuid.uuid) {
            schemaWithUuid.uuid = this._schemaWithUuids.push(schemaWithUuid);
        }
        return schemaWithUuid.uuid;
    };
    ProtoHelper.prototype.getUnionProperties = function (schema) {
        var uuid = this._getSchemaUuid(schema);
        if (!this._unionPropertiesCache[uuid]) {
            this._unionPropertiesCache[uuid] = this._addUnionProperties([], schema.members.map(function (v) { return v.type; }));
        }
        return this._unionPropertiesCache[uuid];
    };
    /**
     * unionProperties: 在Union或Intersection类型中，出现在任意member中的字段
     */
    ProtoHelper.prototype._addUnionProperties = function (unionProperties, schemas) {
        for (var i = 0, len = schemas.length; i < len; ++i) {
            var schema = this.parseReference(schemas[i]);
            // Interface及其Ref 加入interfaces
            if (this.isInterface(schema)) {
                var flat = this.getFlatInterfaceSchema(schema);
                flat.properties.forEach(function (v) {
                    unionProperties.binaryInsert(v.name, true);
                });
                if (flat.indexSignature) {
                    var key = "[[".concat(flat.indexSignature.keyType, "]]");
                    unionProperties.binaryInsert(key, true);
                }
            }
            // Intersection/Union 递归合并unionProperties
            else if (schema.type === tsbufferSchema.SchemaType.Intersection || schema.type === tsbufferSchema.SchemaType.Union) {
                this._addUnionProperties(unionProperties, schema.members.map(function (v) { return v.type; }));
            }
            else if (this.isMappedType(schema)) {
                this._addUnionProperties(unionProperties, [this.parseMappedType(schema)]);
            }
        }
        return unionProperties;
    };
    /**
     * 将unionProperties 扩展到 InterfaceTypeSchema中（optional的any类型）
     * 以此来跳过对它们的检查（用于Intersection/Union）
     */
    ProtoHelper.prototype.applyUnionProperties = function (schema, unionProperties) {
        var newSchema = tslib.__assign(tslib.__assign({}, schema), { properties: schema.properties.slice() });
        var _loop_1 = function (prop) {
            if (prop === '[[String]]') {
                newSchema.indexSignature = newSchema.indexSignature || {
                    keyType: tsbufferSchema.SchemaType.String,
                    type: { type: tsbufferSchema.SchemaType.Any }
                };
            }
            else if (prop === '[[Number]]') {
                newSchema.indexSignature = newSchema.indexSignature || {
                    keyType: tsbufferSchema.SchemaType.Number,
                    type: { type: tsbufferSchema.SchemaType.Any }
                };
            }
            else if (!schema.properties.find(function (v) { return v.name === prop; })) {
                newSchema.properties.push({
                    id: -1,
                    name: prop,
                    optional: true,
                    type: {
                        type: tsbufferSchema.SchemaType.Any
                    }
                });
            }
        };
        for (var _i = 0, unionProperties_1 = unionProperties; _i < unionProperties_1.length; _i++) {
            var prop = unionProperties_1[_i];
            _loop_1(prop);
        }
        return newSchema;
    };
    /**
     * 将interface及其引用转换为展平的schema
     */
    ProtoHelper.prototype.getFlatInterfaceSchema = function (schema) {
        var uuid = this._getSchemaUuid(schema);
        // from cache
        if (this._flatInterfaceSchemaCache[uuid]) {
            return this._flatInterfaceSchemaCache[uuid];
        }
        if (this.isTypeReference(schema)) {
            var parsed = this.parseReference(schema);
            if (parsed.type !== tsbufferSchema.SchemaType.Interface) {
                throw new Error("Cannot flatten non interface type: ".concat(parsed.type));
            }
            this._flatInterfaceSchemaCache[uuid] = this.getFlatInterfaceSchema(parsed);
        }
        else if (schema.type === tsbufferSchema.SchemaType.Interface) {
            this._flatInterfaceSchemaCache[uuid] = this._flattenInterface(schema);
        }
        else if (this.isMappedType(schema)) {
            this._flatInterfaceSchemaCache[uuid] = this._flattenMappedType(schema);
        }
        else {
            // @ts-expect-error
            throw new Error('Invalid interface type: ' + schema.type);
        }
        return this._flatInterfaceSchemaCache[uuid];
    };
    /**
     * 展平interface
     */
    ProtoHelper.prototype._flattenInterface = function (schema) {
        var properties = {};
        var indexSignature;
        // 自身定义的properties和indexSignature优先级最高
        if (schema.properties) {
            for (var _i = 0, _a = schema.properties; _i < _a.length; _i++) {
                var prop = _a[_i];
                properties[prop.name] = {
                    optional: prop.optional,
                    type: prop.type
                };
            }
        }
        if (schema.indexSignature) {
            indexSignature = schema.indexSignature;
        }
        // extends的优先级次之，补全没有定义的字段
        if (schema.extends) {
            for (var _b = 0, _c = schema.extends; _b < _c.length; _b++) {
                var extend = _c[_b];
                // 解引用
                var parsedExtRef = this.parseReference(extend.type);
                if (this.isMappedType(parsedExtRef)) {
                    parsedExtRef = this._flattenMappedType(parsedExtRef);
                }
                if (!this.isInterface(parsedExtRef)) {
                    throw new Error('SchemaError: extends must from interface but from ' + parsedExtRef.type);
                }
                // 递归展平extends
                var flatenExtendsSchema = this.getFlatInterfaceSchema(parsedExtRef);
                // properties
                if (flatenExtendsSchema.properties) {
                    for (var _d = 0, _e = flatenExtendsSchema.properties; _d < _e.length; _d++) {
                        var prop = _e[_d];
                        if (!properties[prop.name]) {
                            properties[prop.name] = {
                                optional: prop.optional,
                                type: prop.type
                            };
                        }
                    }
                }
                // indexSignature
                if (flatenExtendsSchema.indexSignature && !indexSignature) {
                    indexSignature = flatenExtendsSchema.indexSignature;
                }
            }
        }
        return {
            type: tsbufferSchema.SchemaType.Interface,
            properties: Object.entries(properties).map(function (v, i) { return ({
                id: i,
                name: v[0],
                optional: v[1].optional,
                type: v[1].type
            }); }),
            indexSignature: indexSignature
        };
    };
    /** 将MappedTypeSchema转换为展平的Interface
     */
    ProtoHelper.prototype._flattenMappedType = function (schema) {
        // target 解引用
        var target;
        if (this.isTypeReference(schema.target)) {
            var parsed = this.parseReference(schema.target);
            target = parsed;
        }
        else {
            target = schema.target;
        }
        var flatTarget;
        // 内层仍然为MappedType 递归之
        if (target.type === tsbufferSchema.SchemaType.Pick || target.type === tsbufferSchema.SchemaType.Partial || target.type === tsbufferSchema.SchemaType.Omit || target.type === tsbufferSchema.SchemaType.Overwrite) {
            flatTarget = this._flattenMappedType(target);
        }
        else if (target.type === tsbufferSchema.SchemaType.Interface) {
            flatTarget = this._flattenInterface(target);
        }
        else {
            throw new Error("Invalid target.type: ".concat(target.type));
        }
        // 开始执行Mapped逻辑
        if (schema.type === tsbufferSchema.SchemaType.Pick) {
            var properties = [];
            var _loop_2 = function (key) {
                var propItem = flatTarget.properties.find(function (v) { return v.name === key; });
                if (propItem) {
                    properties.push({
                        id: properties.length,
                        name: key,
                        optional: propItem.optional,
                        type: propItem.type
                    });
                }
                else if (flatTarget.indexSignature) {
                    properties.push({
                        id: properties.length,
                        name: key,
                        type: flatTarget.indexSignature.type
                    });
                }
            };
            for (var _i = 0, _a = schema.keys; _i < _a.length; _i++) {
                var key = _a[_i];
                _loop_2(key);
            }
            return {
                type: tsbufferSchema.SchemaType.Interface,
                properties: properties
            };
        }
        else if (schema.type === tsbufferSchema.SchemaType.Partial) {
            for (var _b = 0, _c = flatTarget.properties; _b < _c.length; _b++) {
                var v = _c[_b];
                v.optional = true;
            }
            return flatTarget;
        }
        else if (schema.type === tsbufferSchema.SchemaType.Omit) {
            var _loop_3 = function (key) {
                flatTarget.properties.removeOne(function (v) { return v.name === key; });
            };
            for (var _d = 0, _e = schema.keys; _d < _e.length; _d++) {
                var key = _e[_d];
                _loop_3(key);
            }
            return flatTarget;
        }
        else if (schema.type === tsbufferSchema.SchemaType.Overwrite) {
            var overwrite = this.getFlatInterfaceSchema(schema.overwrite);
            if (overwrite.indexSignature) {
                flatTarget.indexSignature = overwrite.indexSignature;
            }
            var _loop_4 = function (prop) {
                flatTarget.properties.removeOne(function (v) { return v.name === prop.name; });
                flatTarget.properties.push(prop);
            };
            for (var _f = 0, _g = overwrite.properties; _f < _g.length; _f++) {
                var prop = _g[_f];
                _loop_4(prop);
            }
            return flatTarget;
        }
        else {
            throw new Error("Unknown type: ".concat(schema.type));
        }
    };
    ProtoHelper.prototype.parseMappedType = function (schema) {
        // 解嵌套，例如：Pick<Pick<Omit, XXX, 'a'|'b'>>>
        var parents = [];
        var child = schema;
        do {
            parents.push(child);
            child = this.parseReference(child.target);
        } while (this.isMappedType(child));
        // 最内层是 interface，直接返回（validator 会验证 key 匹配）
        if (child.type === tsbufferSchema.SchemaType.Interface) {
            return child;
        }
        // PickOmit<A|B> === PickOmit<A> | PickOmit<B>
        else if (child.type === tsbufferSchema.SchemaType.Union || child.type === tsbufferSchema.SchemaType.Intersection) {
            var newSchema = {
                type: child.type,
                members: child.members.map(function (v) {
                    // 从里面往外装
                    var type = v.type;
                    for (var i = parents.length - 1; i > -1; --i) {
                        var parent_1 = parents[i];
                        type = tslib.__assign(tslib.__assign({}, parent_1), { target: type });
                    }
                    return {
                        id: v.id,
                        type: type
                    };
                })
            };
            return newSchema;
        }
        else {
            throw new Error("Unsupported pattern ".concat(schema.type, "<").concat(child.type, ">"));
        }
    };
    return ProtoHelper;
}());

var _a;
/** @internal */
var ErrorType;
(function (ErrorType) {
    ErrorType["TypeError"] = "TypeError";
    ErrorType["InvalidScalarType"] = "InvalidScalarType";
    ErrorType["TupleOverLength"] = "TupleOverLength";
    ErrorType["InvalidEnumValue"] = "InvalidEnumValue";
    ErrorType["InvalidLiteralValue"] = "InvalidLiteralValue";
    ErrorType["MissingRequiredProperty"] = "MissingRequiredProperty";
    ErrorType["ExcessProperty"] = "ExcessProperty";
    ErrorType["InvalidNumberKey"] = "InvalidNumberKey";
    ErrorType["UnionTypesNotMatch"] = "UnionTypesNotMatch";
    ErrorType["UnionMembersNotMatch"] = "UnionMembersNotMatch";
    ErrorType["CustomError"] = "CustomError";
})(ErrorType || (ErrorType = {}));
/** @internal */
var ErrorMsg = (_a = {},
    _a[ErrorType.TypeError] = function (expect, actual) { return "Expected type to be `".concat(expect, "`, actually `").concat(actual, "`."); },
    _a[ErrorType.InvalidScalarType] = function (value, scalarType) { return "`".concat(value, "` is not a valid `").concat(scalarType, "`."); },
    _a[ErrorType.TupleOverLength] = function (valueLength, schemaLength) { return "Value has ".concat(valueLength, " elements but schema allows only ").concat(schemaLength, "."); },
    _a[ErrorType.InvalidEnumValue] = function (value) { return "`".concat(value, "` is not a valid enum member."); },
    _a[ErrorType.InvalidLiteralValue] = function (expected, actual) { return "Expected to equals `".concat(stringify(expected), "`, actually `").concat(stringify(actual), "`"); },
    _a[ErrorType.MissingRequiredProperty] = function (propName) { return "Missing required property `".concat(propName, "`."); },
    _a[ErrorType.ExcessProperty] = function (propName) { return "Excess property `".concat(propName, "` should not exists."); },
    _a[ErrorType.InvalidNumberKey] = function (key) { return "`".concat(key, "` is not a valid key, the key here should be a `number`."); },
    // Union
    _a[ErrorType.UnionTypesNotMatch] = function (value, types) { return "`".concat(stringify(value), "` is not matched to `").concat(types.join(' | '), "`"); },
    _a[ErrorType.UnionMembersNotMatch] = function (memberErrors) { return "No union member matched, detail:\n".concat(memberErrors.map(function (v, i) { return "  <".concat(i, "> ").concat(v.errMsg); }).join('\n')); },
    _a[ErrorType.CustomError] = function (errMsg) { return errMsg; },
    _a);
/** @internal */
function stringify(value) {
    if (typeof value === 'string') {
        var output = JSON.stringify(value);
        return "'" + output.substr(1, output.length - 2) + "'";
    }
    return JSON.stringify(value);
}

/** @internal */
var ValidateResultError = /** @class */ (function () {
    function ValidateResultError(error) {
        this.isSucc = false;
        this.error = error;
    }
    Object.defineProperty(ValidateResultError.prototype, "errMsg", {
        get: function () {
            return ValidateResultError.getErrMsg(this.error);
        },
        enumerable: false,
        configurable: true
    });
    ValidateResultError.getErrMsg = function (error) {
        var _a;
        var errMsg = ErrorMsg[error.type].apply(ErrorMsg, error.params);
        if ((_a = error.inner) === null || _a === void 0 ? void 0 : _a.property.length) {
            return "Property `".concat(error.inner.property.join('.'), "`: ").concat(errMsg);
        }
        else {
            return errMsg;
        }
    };
    return ValidateResultError;
}());
/** @internal  */
var ValidateResultUtil = /** @class */ (function () {
    function ValidateResultUtil() {
    }
    ValidateResultUtil.error = function (type) {
        var params = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            params[_i - 1] = arguments[_i];
        }
        return new ValidateResultError({
            type: type,
            params: params
        });
    };
    ValidateResultUtil.innerError = function (property, value, schema, error) {
        var _a;
        if (error.error.inner) {
            if (typeof property === 'string') {
                error.error.inner.property.unshift(property);
            }
            else {
                (_a = error.error.inner.property).unshift.apply(_a, property);
            }
        }
        else {
            error.error.inner = {
                property: typeof property === 'string' ? [property] : property,
                value: value,
                schema: schema
            };
        }
        return error;
    };
    ValidateResultUtil.succ = { isSucc: true };
    return ValidateResultUtil;
}());

var typedArrays = {
    Int8Array: Int8Array,
    Int16Array: Int16Array,
    Int32Array: Int32Array,
    BigInt64Array: typeof BigInt64Array !== 'undefined' ? BigInt64Array : undefined,
    Uint8Array: Uint8Array,
    Uint16Array: Uint16Array,
    Uint32Array: Uint32Array,
    BigUint64Array: typeof BigUint64Array !== 'undefined' ? BigUint64Array : undefined,
    Float32Array: Float32Array,
    Float64Array: Float64Array
};
/**
 * TSBuffer Schema Validator
 * @public
 */
var TSBufferValidator = /** @class */ (function () {
    function TSBufferValidator(proto, options) {
        /**
         * Default options
         */
        this.options = {
            excessPropertyChecks: true,
            strictNullChecks: false,
            cloneProto: true
        };
        if (options) {
            this.options = tslib.__assign(tslib.__assign({}, this.options), options);
        }
        this.proto = this.options.cloneProto ? Object.merge({}, proto) : proto;
        this.protoHelper = new ProtoHelper(this.proto);
    }
    /**
     * Validate whether the value is valid to the schema
     * @param value - Value to be validated.
     * @param schemaId - Schema or schema ID.
     * For example, the schema ID for type `Test` in `a/b.ts` may be `a/b/Test`.
     */
    TSBufferValidator.prototype.validate = function (value, schemaOrId, options) {
        var _a, _b;
        var schema;
        var schemaId;
        // Get schema
        if (typeof schemaOrId === 'string') {
            schemaId = schemaOrId;
            schema = this.proto[schemaId];
            if (!schema) {
                throw new Error("Cannot find schema: ".concat(schemaId));
            }
        }
        else {
            schema = schemaOrId;
        }
        // Merge default options
        return this._validate(value, schema, tslib.__assign(tslib.__assign({}, options), { excessPropertyChecks: (_a = options === null || options === void 0 ? void 0 : options.excessPropertyChecks) !== null && _a !== void 0 ? _a : this.options.excessPropertyChecks, strictNullChecks: (_b = options === null || options === void 0 ? void 0 : options.strictNullChecks) !== null && _b !== void 0 ? _b : this.options.strictNullChecks }));
    };
    TSBufferValidator.prototype._validate = function (value, schema, options) {
        var _a;
        var vRes;
        // Validate
        switch (schema.type) {
            case tsbufferSchema.SchemaType.Boolean:
                vRes = this._validateBooleanType(value, schema);
                break;
            case tsbufferSchema.SchemaType.Number:
                vRes = this._validateNumberType(value, schema);
                break;
            case tsbufferSchema.SchemaType.String:
                vRes = this._validateStringType(value, schema);
                break;
            case tsbufferSchema.SchemaType.Array:
                vRes = this._validateArrayType(value, schema, options);
                break;
            case tsbufferSchema.SchemaType.Tuple:
                vRes = this._validateTupleType(value, schema, options);
                break;
            case tsbufferSchema.SchemaType.Enum:
                vRes = this._validateEnumType(value, schema);
                break;
            case tsbufferSchema.SchemaType.Any:
                vRes = this._validateAnyType(value);
                break;
            case tsbufferSchema.SchemaType.Literal:
                vRes = this._validateLiteralType(value, schema, (_a = options === null || options === void 0 ? void 0 : options.strictNullChecks) !== null && _a !== void 0 ? _a : this.options.strictNullChecks);
                break;
            case tsbufferSchema.SchemaType.Object:
                vRes = this._validateObjectType(value, schema);
                break;
            case tsbufferSchema.SchemaType.Interface:
                vRes = this._validateInterfaceType(value, schema, options);
                break;
            case tsbufferSchema.SchemaType.Buffer:
                vRes = this._validateBufferType(value, schema);
                break;
            case tsbufferSchema.SchemaType.IndexedAccess:
            case tsbufferSchema.SchemaType.Reference:
            case tsbufferSchema.SchemaType.Keyof:
                vRes = this._validateReferenceType(value, schema, options);
                break;
            case tsbufferSchema.SchemaType.Union:
                vRes = this._validateUnionType(value, schema, options);
                break;
            case tsbufferSchema.SchemaType.Intersection:
                vRes = this._validateIntersectionType(value, schema, options);
                break;
            case tsbufferSchema.SchemaType.Pick:
            case tsbufferSchema.SchemaType.Omit:
            case tsbufferSchema.SchemaType.Partial:
            case tsbufferSchema.SchemaType.Overwrite:
                vRes = this._validateMappedType(value, schema, options);
                break;
            case tsbufferSchema.SchemaType.Date:
                vRes = this._validateDateType(value);
                break;
            case tsbufferSchema.SchemaType.NonNullable:
                vRes = this._validateNonNullableType(value, schema, options);
                break;
            case tsbufferSchema.SchemaType.Custom:
                var res = schema.validate(value);
                vRes = res.isSucc ? ValidateResultUtil.succ : ValidateResultUtil.error(ErrorType.CustomError, res.errMsg);
                break;
            // 错误的type
            default:
                // @ts-expect-error
                throw new Error("Unsupported schema type: ".concat(schema.type));
        }
        // prune
        if (options === null || options === void 0 ? void 0 : options.prune) {
            // don't need prune, return original value
            if (options.prune.output === undefined) {
                options.prune.output = value;
            }
            // output to parent
            if (options.prune.parent) {
                options.prune.parent.value[options.prune.parent.key] = options.prune.output;
            }
        }
        return vRes;
    };
    /**
     * 修剪 Object，移除 Schema 中未定义的 Key
     * 需要确保 value 类型合法
     * @param value - value to be validated
     * @param schemaOrId -Schema or schema ID.
     * @returns Validate result and pruned value. if validate failed, `pruneOutput` would be undefined.
     */
    TSBufferValidator.prototype.prune = function (value, schemaOrId, options) {
        var _a;
        var schema = typeof schemaOrId === 'string' ? this.proto[schemaOrId] : schemaOrId;
        if (!schema) {
            throw new Error('Cannot find schema: ' + schemaOrId);
        }
        var prune = {};
        var vRes = this._validate(value, schema, tslib.__assign(tslib.__assign({}, options), { prune: prune, excessPropertyChecks: false, strictNullChecks: (_a = options === null || options === void 0 ? void 0 : options.strictNullChecks) !== null && _a !== void 0 ? _a : this.options.strictNullChecks }));
        if (vRes.isSucc) {
            vRes.pruneOutput = prune.output;
        }
        return vRes;
    };
    TSBufferValidator.prototype._validateBooleanType = function (value, schema) {
        var type = this._getTypeof(value);
        if (type === 'boolean') {
            return ValidateResultUtil.succ;
        }
        else {
            return ValidateResultUtil.error(ErrorType.TypeError, 'boolean', type);
        }
    };
    TSBufferValidator.prototype._validateNumberType = function (value, schema) {
        // 默认为double
        var scalarType = schema.scalarType || 'double';
        // Wrong Type
        var type = this._getTypeof(value);
        var rightType = scalarType.indexOf('big') > -1 ? 'bigint' : 'number';
        if (type !== rightType) {
            return ValidateResultUtil.error(ErrorType.TypeError, rightType, type);
        }
        // scalarType类型检测
        // 整形却为小数
        if (scalarType !== 'double' && type === 'number' && !Number.isInteger(value)) {
            return ValidateResultUtil.error(ErrorType.InvalidScalarType, value, scalarType);
        }
        // 无符号整形却为负数
        if (scalarType.indexOf('uint') > -1 && value < 0) {
            return ValidateResultUtil.error(ErrorType.InvalidScalarType, value, scalarType);
        }
        return ValidateResultUtil.succ;
    };
    TSBufferValidator.prototype._validateStringType = function (value, schema) {
        var type = this._getTypeof(value);
        return type === 'string' ? ValidateResultUtil.succ : ValidateResultUtil.error(ErrorType.TypeError, 'string', type);
    };
    TSBufferValidator.prototype._validateArrayType = function (value, schema, options) {
        // is Array type
        var type = this._getTypeof(value);
        if (type !== tsbufferSchema.SchemaType.Array) {
            return ValidateResultUtil.error(ErrorType.TypeError, tsbufferSchema.SchemaType.Array, type);
        }
        // prune output
        var prune = options.prune;
        if (prune) {
            prune.output = Array.from({ length: value.length });
        }
        // validate elementType
        for (var i = 0; i < value.length; ++i) {
            var elemValidateResult = this._validate(value[i], schema.elementType, tslib.__assign(tslib.__assign({}, options), { prune: (prune === null || prune === void 0 ? void 0 : prune.output) ? {
                    parent: {
                        value: prune.output,
                        key: i
                    }
                } : undefined }));
            if (!elemValidateResult.isSucc) {
                return ValidateResultUtil.innerError('' + i, value[i], schema.elementType, elemValidateResult);
            }
        }
        return ValidateResultUtil.succ;
    };
    TSBufferValidator.prototype._validateTupleType = function (value, schema, options) {
        // is Array type
        var type = this._getTypeof(value);
        if (type !== tsbufferSchema.SchemaType.Array) {
            return ValidateResultUtil.error(ErrorType.TypeError, tsbufferSchema.SchemaType.Array, type);
        }
        var prune = options.prune;
        // validate length
        // excessPropertyChecks 与 prune互斥
        if (!prune && options.excessPropertyChecks && value.length > schema.elementTypes.length) {
            return ValidateResultUtil.error(ErrorType.TupleOverLength, value.length, schema.elementTypes.length);
        }
        // prune output
        if (prune) {
            prune.output = Array.from({ length: Math.min(value.length, schema.elementTypes.length) });
        }
        // validate elementType
        for (var i = 0; i < schema.elementTypes.length; ++i) {
            // MissingRequiredProperty: NotOptional && is undefined
            if (value[i] === undefined || value[i] === null && !options.strictNullChecks) {
                var canBeNull = this._canBeNull(schema.elementTypes[i]);
                var canBeUndefined = schema.optionalStartIndex !== undefined && i >= schema.optionalStartIndex || this._canBeUndefined(schema.elementTypes[i]);
                var isOptional = canBeUndefined || !options.strictNullChecks && canBeNull;
                // skip undefined property
                if (isOptional) {
                    // Prune null & undefined->null
                    if (prune === null || prune === void 0 ? void 0 : prune.output) {
                        if (value[i] === null && canBeNull
                            || value[i] === undefined && !canBeUndefined && canBeNull) {
                            prune.output[i] = null;
                        }
                    }
                    continue;
                }
                else {
                    return ValidateResultUtil.error(ErrorType.MissingRequiredProperty, i);
                }
            }
            // element type check
            var elemValidateResult = this._validate(value[i], schema.elementTypes[i], {
                prune: (prune === null || prune === void 0 ? void 0 : prune.output) ? {
                    parent: {
                        value: prune.output,
                        key: i
                    }
                } : undefined,
                strictNullChecks: options.strictNullChecks,
                excessPropertyChecks: options.excessPropertyChecks
            });
            if (!elemValidateResult.isSucc) {
                return ValidateResultUtil.innerError('' + i, value[i], schema.elementTypes[i], elemValidateResult);
            }
        }
        return ValidateResultUtil.succ;
    };
    TSBufferValidator.prototype._canBeUndefined = function (schema) {
        var _this = this;
        if (schema.type === tsbufferSchema.SchemaType.Union) {
            return schema.members.some(function (v) { return _this._canBeUndefined(v.type); });
        }
        if (schema.type === tsbufferSchema.SchemaType.Literal && schema.literal === undefined) {
            return true;
        }
        return false;
    };
    TSBufferValidator.prototype._canBeNull = function (schema) {
        var _this = this;
        if (schema.type === tsbufferSchema.SchemaType.Union) {
            return schema.members.some(function (v) { return _this._canBeNull(v.type); });
        }
        if (schema.type === tsbufferSchema.SchemaType.Literal && schema.literal === null) {
            return true;
        }
        return false;
    };
    TSBufferValidator.prototype._validateEnumType = function (value, schema) {
        // must be string or number
        var type = this._getTypeof(value);
        if (type !== 'string' && type !== 'number') {
            return ValidateResultUtil.error(ErrorType.TypeError, 'string | number', type);
        }
        // 有值与预设相同
        if (schema.members.some(function (v) { return v.value === value; })) {
            return ValidateResultUtil.succ;
        }
        else {
            return ValidateResultUtil.error(ErrorType.InvalidEnumValue, value);
        }
    };
    TSBufferValidator.prototype._validateAnyType = function (value) {
        return ValidateResultUtil.succ;
    };
    TSBufferValidator.prototype._validateLiteralType = function (value, schema, strictNullChecks) {
        // 非strictNullChecks严格模式，null undefined同等对待
        if (!strictNullChecks && (schema.literal === null || schema.literal === undefined)) {
            return value === null || value === undefined ?
                ValidateResultUtil.succ
                : ValidateResultUtil.error(ErrorType.InvalidLiteralValue, schema.literal, value);
        }
        return value === schema.literal ?
            ValidateResultUtil.succ
            : ValidateResultUtil.error(ErrorType.InvalidLiteralValue, schema.literal, value);
    };
    TSBufferValidator.prototype._validateObjectType = function (value, schema) {
        var type = this._getTypeof(value);
        return type === 'Object' || type === 'Array' ? ValidateResultUtil.succ : ValidateResultUtil.error(ErrorType.TypeError, 'Object', type);
    };
    TSBufferValidator.prototype._validateInterfaceType = function (value, schema, options) {
        var type = this._getTypeof(value);
        if (type !== 'Object') {
            return ValidateResultUtil.error(ErrorType.TypeError, 'Object', type);
        }
        // 先展平
        var flatSchema = this.protoHelper.getFlatInterfaceSchema(schema);
        // From union or intersecton type
        if (options.unionProperties) {
            flatSchema = this.protoHelper.applyUnionProperties(flatSchema, options.unionProperties);
        }
        return this._validateFlatInterface(value, flatSchema, options);
    };
    TSBufferValidator.prototype._validateMappedType = function (value, schema, options) {
        var parsed = this.protoHelper.parseMappedType(schema);
        if (parsed.type === tsbufferSchema.SchemaType.Interface) {
            return this._validateInterfaceType(value, schema, options);
        }
        else if (parsed.type === tsbufferSchema.SchemaType.Union) {
            return this._validateUnionType(value, parsed, options);
        }
        else if (parsed.type === tsbufferSchema.SchemaType.Intersection) {
            return this._validateIntersectionType(value, parsed, options);
        }
        // @ts-expect-error
        throw new Error("Invalid ".concat(schema.type, " target type: ").concat(parsed.type));
    };
    TSBufferValidator.prototype._validateFlatInterface = function (value, schema, options) {
        // interfaceSignature强制了key必须是数字的情况
        if (schema.indexSignature && schema.indexSignature.keyType === tsbufferSchema.SchemaType.Number) {
            for (var key in value) {
                if (!this._isNumberKey(key)) {
                    return ValidateResultUtil.error(ErrorType.InvalidNumberKey, key);
                }
            }
        }
        var prune = options.prune;
        if (prune) {
            prune.output = {};
        }
        // Excess property check (与prune互斥)
        if (!prune && options.excessPropertyChecks && !schema.indexSignature) {
            var validProperties_1 = schema.properties.map(function (v) { return v.name; });
            var firstExcessProperty = Object.keys(value).find(function (v) { return validProperties_1.indexOf(v) === -1; });
            if (firstExcessProperty) {
                return ValidateResultUtil.error(ErrorType.ExcessProperty, firstExcessProperty);
            }
        }
        // 校验properties
        if (schema.properties) {
            for (var _i = 0, _a = schema.properties; _i < _a.length; _i++) {
                var property = _a[_i];
                // MissingRequiredProperty: is undefined && !isOptional
                if (value[property.name] === undefined || value[property.name] === null && !options.strictNullChecks) {
                    var canBeNull = this._canBeNull(property.type);
                    var canBeUndefined = property.optional || this._canBeUndefined(property.type);
                    var isOptional = canBeUndefined || !options.strictNullChecks && canBeNull;
                    // skip undefined optional property
                    if (isOptional) {
                        // Prune null & undefined->null
                        if (prune === null || prune === void 0 ? void 0 : prune.output) {
                            if (value[property.name] === null && canBeNull
                                || value[property.name] === undefined && !canBeUndefined && canBeNull) {
                                prune.output[property.name] = null;
                            }
                        }
                        continue;
                    }
                    else {
                        return ValidateResultUtil.error(ErrorType.MissingRequiredProperty, property.name);
                    }
                }
                // property本身验证
                var vRes = this._validate(value[property.name], property.type, {
                    prune: (prune === null || prune === void 0 ? void 0 : prune.output) && property.id > -1 ? {
                        parent: {
                            value: prune.output,
                            key: property.name
                        }
                    } : undefined,
                    strictNullChecks: options.strictNullChecks,
                    excessPropertyChecks: options.excessPropertyChecks
                });
                if (!vRes.isSucc) {
                    return ValidateResultUtil.innerError(property.name, value[property.name], property.type, vRes);
                }
            }
        }
        // 检测indexSignature
        if (schema.indexSignature) {
            for (var key in value) {
                // only prune is (property is pruned already)
                // let memberPrune: ValidatePruneOptions | undefined = schema.properties.some(v => v.name === key) ? undefined : {};
                // validate each field
                var vRes = this._validate(value[key], schema.indexSignature.type, {
                    prune: (prune === null || prune === void 0 ? void 0 : prune.output) ? {
                        parent: {
                            value: prune.output,
                            key: key
                        }
                    } : undefined,
                    strictNullChecks: options.strictNullChecks,
                    excessPropertyChecks: options.excessPropertyChecks
                });
                if (!vRes.isSucc) {
                    return ValidateResultUtil.innerError(key, value[key], schema.indexSignature.type, vRes);
                }
            }
        }
        return ValidateResultUtil.succ;
    };
    TSBufferValidator.prototype._validateBufferType = function (value, schema) {
        var _a, _b;
        var type = this._getTypeof(value);
        if (type !== 'Object') {
            return ValidateResultUtil.error(ErrorType.TypeError, schema.arrayType || 'ArrayBuffer', type);
        }
        else if (schema.arrayType) {
            var typeArrayClass = typedArrays[schema.arrayType];
            if (!typeArrayClass) {
                throw new Error("Error TypedArray type: ".concat(schema.arrayType));
            }
            return value instanceof typeArrayClass ? ValidateResultUtil.succ : ValidateResultUtil.error(ErrorType.TypeError, schema.arrayType, (_a = value === null || value === void 0 ? void 0 : value.constructor) === null || _a === void 0 ? void 0 : _a.name);
        }
        else {
            return value instanceof ArrayBuffer ? ValidateResultUtil.succ : ValidateResultUtil.error(ErrorType.TypeError, 'ArrayBuffer', (_b = value === null || value === void 0 ? void 0 : value.constructor) === null || _b === void 0 ? void 0 : _b.name);
        }
    };
    TSBufferValidator.prototype._validateReferenceType = function (value, schema, options) {
        return this._validate(value, this.protoHelper.parseReference(schema), options);
    };
    TSBufferValidator.prototype._validateUnionType = function (value, schema, options) {
        var _this = this;
        options.unionProperties = options.unionProperties || this.protoHelper.getUnionProperties(schema);
        var isObjectPrune = false;
        var prune = options.prune;
        if (prune && value && Object.getPrototypeOf(value) === Object.prototype) {
            isObjectPrune = true;
            prune.output = {};
        }
        // 有一成功则成功
        var isSomeSucc = false;
        var memberErrors = [];
        for (var i = 0; i < schema.members.length; ++i) {
            var member = schema.members[i];
            var memberType = this.protoHelper.isTypeReference(member.type) ? this.protoHelper.parseReference(member.type) : member.type;
            var memberPrune = prune ? {} : undefined;
            var vRes = this._validate(value, memberType, tslib.__assign(tslib.__assign({}, options), { prune: memberPrune }));
            if (vRes.isSucc) {
                isSomeSucc = true;
                // if prune object: must prune all members
                if (isObjectPrune) {
                    prune.output = tslib.__assign(tslib.__assign({}, prune.output), memberPrune.output);
                }
                // not prune object: stop checking after 1st member matched
                else {
                    break;
                }
            }
            else {
                memberErrors.push(vRes);
            }
        }
        // 有一成功则成功;
        if (isSomeSucc) {
            return ValidateResultUtil.succ;
        }
        // 全部失败，则失败
        else {
            // All member error is the same, return the first
            var msg0_1 = memberErrors[0].errMsg;
            if (memberErrors.every(function (v) { return v.errMsg === msg0_1; })) {
                return memberErrors[0];
            }
            // mutual exclusion: return the only one
            var nonLiteralErrors = memberErrors.filter(function (v) { return v.error.type !== ErrorType.InvalidLiteralValue; });
            if (nonLiteralErrors.length === 1) {
                return nonLiteralErrors[0];
            }
            // All member error without inner: show simple msg
            if (memberErrors.every(function (v) { return !v.error.inner && (v.error.type === ErrorType.TypeError || v.error.type === ErrorType.InvalidLiteralValue); })) {
                var valueType = this._getTypeof(value);
                var expectedTypes = memberErrors.map(function (v) { return v.error.type === ErrorType.TypeError ? v.error.params[0] : _this._getTypeof(v.error.params[0]); }).distinct();
                // Expected type A|B|C, actually type D
                if (expectedTypes.indexOf(valueType) === -1) {
                    return ValidateResultUtil.error(ErrorType.TypeError, expectedTypes.join(' | '), this._getTypeof(value));
                }
                // `'D'` is not matched to `'A'|'B'|'C'`
                if (valueType !== 'Object' && valueType !== tsbufferSchema.SchemaType.Array) {
                    var types = memberErrors.map(function (v) { return v.error.type === ErrorType.TypeError ? v.error.params[0] : stringify(v.error.params[0]); }).distinct();
                    return ValidateResultUtil.error(ErrorType.UnionTypesNotMatch, value, types);
                }
            }
            // other errors
            return ValidateResultUtil.error(ErrorType.UnionMembersNotMatch, memberErrors);
        }
    };
    TSBufferValidator.prototype._validateIntersectionType = function (value, schema, options) {
        options.unionProperties = options.unionProperties || this.protoHelper.getUnionProperties(schema);
        var isObjectPrune = false;
        var prune = options.prune;
        if (prune && value && Object.getPrototypeOf(value) === Object.prototype) {
            prune.output = {};
            isObjectPrune = true;
        }
        // 有一失败则失败
        for (var i = 0, len = schema.members.length; i < len; ++i) {
            // 验证member
            var memberType = schema.members[i].type;
            memberType = this.protoHelper.isTypeReference(memberType) ? this.protoHelper.parseReference(memberType) : memberType;
            var memberPrune = prune ? {} : undefined;
            var vRes = this._validate(value, memberType, tslib.__assign(tslib.__assign({}, options), { prune: memberPrune }));
            // 有一失败则失败
            if (!vRes.isSucc) {
                return vRes;
            }
            if (isObjectPrune) {
                prune.output = tslib.__assign(tslib.__assign({}, prune.output), memberPrune.output);
            }
        }
        // 全成功则成功
        return ValidateResultUtil.succ;
    };
    TSBufferValidator.prototype._validateDateType = function (value) {
        if (value instanceof Date) {
            return ValidateResultUtil.succ;
        }
        else {
            return ValidateResultUtil.error(ErrorType.TypeError, 'Date', this._getTypeof(value));
        }
    };
    TSBufferValidator.prototype._validateNonNullableType = function (value, schema, options) {
        var type = this._getTypeof(value);
        if ((type === 'null' || type === 'undefined') && schema.target.type !== 'Any') {
            return ValidateResultUtil.error(ErrorType.TypeError, 'NonNullable', type);
        }
        return this._validate(value, schema.target, options);
    };
    TSBufferValidator.prototype._isNumberKey = function (key) {
        var int = parseInt(key);
        return !(isNaN(int) || ('' + int) !== key);
    };
    TSBufferValidator.prototype._getTypeof = function (value) {
        var type = typeof value;
        if (type === 'object') {
            if (value === null) {
                return 'null';
            }
            else if (Array.isArray(value)) {
                return tsbufferSchema.SchemaType.Array;
            }
            else {
                return 'Object';
            }
        }
        return type;
    };
    return TSBufferValidator;
}());

exports.ProtoHelper = ProtoHelper;
exports.TSBufferValidator = TSBufferValidator;

}, function(modId) {var map = {}; return __REQUIRE__(map[modId], modId); })
return __REQUIRE__(1667821180094);
})()
//miniprogram-npm-outsideDeps=["k8w-extend-native","tslib","tsbuffer-schema"]
//# sourceMappingURL=index.js.map