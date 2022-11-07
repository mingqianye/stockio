module.exports = (function() {
var __MODS__ = {};
var __DEFINE__ = function(modId, func, req) { var m = { exports: {}, _tempexports: {} }; __MODS__[modId] = { status: 0, func: func, req: req, m: m }; };
var __REQUIRE__ = function(modId, source) { if(!__MODS__[modId]) return require(source); if(!__MODS__[modId].status) { var m = __MODS__[modId].m; m._exports = m._tempexports; var desp = Object.getOwnPropertyDescriptor(m, "exports"); if (desp && desp.configurable) Object.defineProperty(m, "exports", { set: function (val) { if(typeof val === "object" && val !== m._exports) { m._exports.__proto__ = val.__proto__; Object.keys(val).forEach(function (k) { m._exports[k] = val[k]; }); } m._tempexports = val }, get: function () { return m._tempexports; } }); __MODS__[modId].status = 1; __MODS__[modId].func(__MODS__[modId].req, m, m.exports); } return __MODS__[modId].m.exports; };
var __REQUIRE_WILDCARD__ = function(obj) { if(obj && obj.__esModule) { return obj; } else { var newObj = {}; if(obj != null) { for(var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) newObj[k] = obj[k]; } } newObj.default = obj; return newObj; } };
var __REQUIRE_DEFAULT__ = function(obj) { return obj && obj.__esModule ? obj.default : obj; };
__DEFINE__(1667821180093, function(require, module, exports) {
/*!
 * TSBuffer Schema v2.2.0
 * -----------------------------------------
 * MIT LICENSE
 * KingWorks (C) Copyright 2022
 * https://github.com/k8w/tsbuffer-schema
 */


Object.defineProperty(exports, '__esModule', { value: true });

/**
 * Enum for every possible `TSBufferSchema['type']`
 */
var SchemaType = /** @class */ (function () {
    function SchemaType() {
    }
    // #region 确定的TypeScript的类型
    SchemaType.Boolean = 'Boolean';
    SchemaType.Number = 'Number';
    SchemaType.String = 'String';
    SchemaType.Array = 'Array';
    SchemaType.Tuple = 'Tuple';
    SchemaType.Enum = 'Enum';
    SchemaType.Any = 'Any';
    SchemaType.Literal = 'Literal';
    SchemaType.Object = 'Object';
    SchemaType.Interface = 'Interface';
    SchemaType.Buffer = 'Buffer';
    SchemaType.IndexedAccess = 'IndexedAccess';
    SchemaType.Reference = 'Reference';
    SchemaType.Keyof = 'Keyof';
    SchemaType.Union = 'Union';
    SchemaType.Intersection = 'Intersection';
    SchemaType.NonNullable = 'NonNullable';
    SchemaType.Date = 'Date';
    // #endregion
    // #region 非TypeScript基本类型，临时过渡用
    SchemaType.Pick = 'Pick';
    SchemaType.Partial = 'Partial';
    SchemaType.Omit = 'Omit';
    SchemaType.Overwrite = 'Overwrite';
    // #endregion
    SchemaType.Custom = 'Custom';
    return SchemaType;
}());

exports.SchemaType = SchemaType;

}, function(modId) {var map = {}; return __REQUIRE__(map[modId], modId); })
return __REQUIRE__(1667821180093);
})()
//miniprogram-npm-outsideDeps=[]
//# sourceMappingURL=index.js.map