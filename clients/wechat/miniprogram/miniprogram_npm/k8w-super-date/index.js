module.exports = (function() {
var __MODS__ = {};
var __DEFINE__ = function(modId, func, req) { var m = { exports: {}, _tempexports: {} }; __MODS__[modId] = { status: 0, func: func, req: req, m: m }; };
var __REQUIRE__ = function(modId, source) { if(!__MODS__[modId]) return require(source); if(!__MODS__[modId].status) { var m = __MODS__[modId].m; m._exports = m._tempexports; var desp = Object.getOwnPropertyDescriptor(m, "exports"); if (desp && desp.configurable) Object.defineProperty(m, "exports", { set: function (val) { if(typeof val === "object" && val !== m._exports) { m._exports.__proto__ = val.__proto__; Object.keys(val).forEach(function (k) { m._exports[k] = val[k]; }); } m._tempexports = val }, get: function () { return m._tempexports; } }); __MODS__[modId].status = 1; __MODS__[modId].func(__MODS__[modId].req, m, m.exports); } return __MODS__[modId].m.exports; };
var __REQUIRE_WILDCARD__ = function(obj) { if(obj && obj.__esModule) { return obj; } else { var newObj = {}; if(obj != null) { for(var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) newObj[k] = obj[k]; } } newObj.default = obj; return newObj; } };
var __REQUIRE_DEFAULT__ = function(obj) { return obj && obj.__esModule ? obj.default : obj; };
__DEFINE__(1667821180091, function(require, module, exports) {

///<reference path="index.d.ts"/>
function prependZero(matched, num) {
    return matched.length > 1 && num < 10 ? "0" + num : "" + num;
}
Date.prototype.format = function (pattern) {
    var _this = this;
    if (pattern === void 0) { pattern = 'YYYY-MM-DD hh:mm:ss'; }
    return pattern.replace(/y{2,}|Y{2,}/, function (v) { return (_this.getFullYear() + "").substr(4 - v.length); })
        .replace(/M{1,2}/, function (v) { return prependZero(v, _this.getMonth() + 1); })
        .replace(/D{1,2}|d{1,2}/, function (v) { return prependZero(v, _this.getDate()); })
        .replace(/Q|q/, function (v) { return prependZero(v, Math.ceil((_this.getMonth() + 1) / 3)); })
        .replace(/h{1,2}|H{1,2}/, function (v) { return prependZero(v, _this.getHours()); })
        .replace(/m{1,2}/, function (v) { return prependZero(v, _this.getMinutes()); })
        .replace(/s{1,2}/, function (v) { return prependZero(v, _this.getSeconds()); })
        .replace(/SSS|S/, function (v) {
        var ms = '' + _this.getMilliseconds();
        return v.length === 1 ? ms : "" + (ms.length === 1 ? '00' : ms.length === 2 ? '0' : '') + ms;
    });
};
Date.today = function () {
    var now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
};

}, function(modId) {var map = {}; return __REQUIRE__(map[modId], modId); })
return __REQUIRE__(1667821180091);
})()
//miniprogram-npm-outsideDeps=[]
//# sourceMappingURL=index.js.map