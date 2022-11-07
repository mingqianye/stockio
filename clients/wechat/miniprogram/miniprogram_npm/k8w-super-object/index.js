module.exports = (function() {
var __MODS__ = {};
var __DEFINE__ = function(modId, func, req) { var m = { exports: {}, _tempexports: {} }; __MODS__[modId] = { status: 0, func: func, req: req, m: m }; };
var __REQUIRE__ = function(modId, source) { if(!__MODS__[modId]) return require(source); if(!__MODS__[modId].status) { var m = __MODS__[modId].m; m._exports = m._tempexports; var desp = Object.getOwnPropertyDescriptor(m, "exports"); if (desp && desp.configurable) Object.defineProperty(m, "exports", { set: function (val) { if(typeof val === "object" && val !== m._exports) { m._exports.__proto__ = val.__proto__; Object.keys(val).forEach(function (k) { m._exports[k] = val[k]; }); } m._tempexports = val }, get: function () { return m._tempexports; } }); __MODS__[modId].status = 1; __MODS__[modId].func(__MODS__[modId].req, m, m.exports); } return __MODS__[modId].m.exports; };
var __REQUIRE_WILDCARD__ = function(obj) { if(obj && obj.__esModule) { return obj; } else { var newObj = {}; if(obj != null) { for(var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) newObj[k] = obj[k]; } } newObj.default = obj; return newObj; } };
var __REQUIRE_DEFAULT__ = function(obj) { return obj && obj.__esModule ? obj.default : obj; };
__DEFINE__(1667821180092, function(require, module, exports) {

///<reference path="index.d.ts"/>
/**
 * 将sources合并到target，该合并全部是深拷贝
 * @param target
 * @param sources
 * @returns {Object}
 */
Object.merge = function (target) {
    var sources = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        sources[_i - 1] = arguments[_i];
    }
    for (var i = 0; i < sources.length; ++i) {
        var source = sources[i];
        if (typeof source != 'object' || source == null) {
            continue;
        }
        for (var skey in source) {
            //只处理自身的key 这里可能来自于外部prototype的扩展
            if (!source.hasOwnProperty(skey)) {
                continue;
            }
            if (source[skey] instanceof Date) {
                //Date类型 要克隆一份 保证深拷贝
                target[skey] = new Date(source[skey]);
                continue;
            }
            else if (typeof (target[skey]) == 'object' && target[skey] != null && typeof (source[skey]) == 'object' && source[skey] != null) {
                // 两个都是Object 递归merge之
                Object.merge(target[skey], source[skey]);
            }
            else {
                if (Array.isArray(source[skey])) {
                    // 数组merge后还是数组
                    target[skey] = Object.merge([], source[skey]);
                }
                else if (typeof (source[skey]) == 'object' && source[skey] !== null) {
                    // Object要克隆一份以确保深拷贝
                    target[skey] = Object.merge({}, source[skey]);
                }
                else {
                    // 基本类型 直接赋值即可
                    target[skey] = source[skey];
                }
            }
        }
    }
    return target;
};
if (!Object.values) {
    Object.values = function (obj) {
        var output = [];
        for (var k in obj) {
            obj.hasOwnProperty(k) && output.push(obj[k]);
        }
        return output;
    };
}
if (!Object.entries) {
    Object.entries = function (obj) {
        var output = [];
        for (var key in obj) {
            if (!obj.hasOwnProperty(key)) {
                continue;
            }
            output.push([key, obj[key]]);
        }
        return output;
    };
}
Object.forEach = function (obj, handler) {
    for (var key in obj) {
        if (!obj.hasOwnProperty(key)) {
            return;
        }
        handler(obj[key], key, obj);
    }
};

}, function(modId) {var map = {}; return __REQUIRE__(map[modId], modId); })
return __REQUIRE__(1667821180092);
})()
//miniprogram-npm-outsideDeps=[]
//# sourceMappingURL=index.js.map