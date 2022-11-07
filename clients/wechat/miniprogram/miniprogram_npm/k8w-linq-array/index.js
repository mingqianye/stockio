module.exports = (function() {
var __MODS__ = {};
var __DEFINE__ = function(modId, func, req) { var m = { exports: {}, _tempexports: {} }; __MODS__[modId] = { status: 0, func: func, req: req, m: m }; };
var __REQUIRE__ = function(modId, source) { if(!__MODS__[modId]) return require(source); if(!__MODS__[modId].status) { var m = __MODS__[modId].m; m._exports = m._tempexports; var desp = Object.getOwnPropertyDescriptor(m, "exports"); if (desp && desp.configurable) Object.defineProperty(m, "exports", { set: function (val) { if(typeof val === "object" && val !== m._exports) { m._exports.__proto__ = val.__proto__; Object.keys(val).forEach(function (k) { m._exports[k] = val[k]; }); } m._tempexports = val }, get: function () { return m._tempexports; } }); __MODS__[modId].status = 1; __MODS__[modId].func(__MODS__[modId].req, m, m.exports); } return __MODS__[modId].m.exports; };
var __REQUIRE_WILDCARD__ = function(obj) { if(obj && obj.__esModule) { return obj; } else { var newObj = {}; if(obj != null) { for(var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) newObj[k] = obj[k]; } } newObj.default = obj; return newObj; } };
var __REQUIRE_DEFAULT__ = function(obj) { return obj && obj.__esModule ? obj.default : obj; };
__DEFINE__(1667821180090, function(require, module, exports) {

///<reference path="index.d.ts"/>
var _a;
var extendFuncs = {
    remove: function (filter) {
        if (typeof (filter) == 'function') {
            for (var i = this.length - 1; i > -1; --i) {
                filter(this[i], i, this) && this.splice(i, 1);
            }
        }
        else {
            for (var i = this.length - 1; i > -1; --i) {
                this[i] === filter && this.splice(i, 1);
            }
        }
        return this;
    },
    removeOne: function (filter) {
        if (typeof (filter) == 'function') {
            for (var i = 0; i < this.length; ++i) {
                if (filter(this[i], i, this)) {
                    this.splice(i, 1);
                    return this;
                }
            }
        }
        else {
            for (var i = 0; i < this.length; ++i) {
                if (this[i] === filter) {
                    this.splice(i, 1);
                    return this;
                }
            }
        }
        return this;
    },
    first: function () {
        return this.length ? this[0] : null;
    },
    last: function () {
        return this.length ? this[this.length - 1] : null;
    },
    max: function (mapper) {
        if (!this.length) {
            return null;
        }
        if (typeof (mapper) == 'function') {
            var max = mapper(this[0], 0, this);
            for (var i = 1; i < this.length; ++i) {
                var temp = mapper(this[i], i, this);
                max = temp > max ? temp : max;
            }
            return max;
        }
        else {
            return this.reduce(function (prev, cur) { return prev > cur ? prev : cur; });
        }
    },
    min: function (mapper) {
        if (!this.length) {
            return null;
        }
        function _min(a, b) {
            return a < b ? a : b;
        }
        if (typeof (mapper) == 'function') {
            var min = mapper(this[0], 0, this);
            for (var i = 1; i < this.length; ++i) {
                var temp = mapper(this[i], i, this);
                min = temp < min ? temp : min;
            }
            return min;
        }
        else {
            return this.reduce(function (prev, cur) { return _min(prev, cur); });
        }
    },
    distinct: function () {
        return this.filter(function (v, i, arr) { return arr.indexOf(v) === i; });
    },
    filterIndex: function (filter) {
        var output = [];
        for (var i = 0; i < this.length; ++i) {
            if (filter(this[i], i, this)) {
                output.push(i);
            }
        }
        return output;
    },
    count: function (filter) {
        var result = 0;
        for (var i = 0; i < this.length; ++i) {
            if (filter(this[i], i, this)) {
                ++result;
            }
        }
        return result;
    },
    sum: function (mapper) {
        var result = 0;
        for (var i = 0; i < this.length; ++i) {
            result += mapper ? mapper(this[i], i, this) : this[i];
        }
        return result;
    },
    average: function (mapper) {
        return this.sum(mapper) / this.length;
    },
    orderBy: function () {
        var mappers = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            mappers[_i] = arguments[_i];
        }
        return this.slice().sort(function (a, b) {
            for (var i = 0; i < mappers.length; ++i) {
                var va = mappers[i](a);
                var vb = mappers[i](b);
                if (va > vb) {
                    return 1;
                }
                else if (va < vb) {
                    return -1;
                }
            }
            return 0;
        });
    },
    orderByDesc: function () {
        var mappers = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            mappers[_i] = arguments[_i];
        }
        return this.slice().sort(function (a, b) {
            for (var i = 0; i < mappers.length; ++i) {
                var va = mappers[i](a);
                var vb = mappers[i](b);
                if (va > vb) {
                    return -1;
                }
                else if (va < vb) {
                    return 1;
                }
            }
            return 0;
        });
    },
    binarySearch: function (value, keyMapper) {
        var low = 0, high = this.length - 1;
        while (low <= high) {
            var mid = ((high + low) / 2) | 0;
            var midValue = keyMapper ? keyMapper(this[mid]) : this[mid];
            if (value === midValue) {
                return mid;
            }
            else if (value > midValue) {
                low = mid + 1;
            }
            else if (value < midValue) {
                high = mid - 1;
            }
        }
        return -1;
    },
    binaryInsert: function (item, keyMapper, unique) {
        if (typeof (keyMapper) == 'boolean') {
            unique = keyMapper;
            keyMapper = undefined;
        }
        var low = 0, high = this.length - 1;
        var mid = NaN;
        var itemValue = keyMapper ? keyMapper(item) : item;
        while (low <= high) {
            mid = ((high + low) / 2) | 0;
            var midValue = keyMapper ? keyMapper(this[mid]) : this[mid];
            if (itemValue === midValue) {
                if (unique) {
                    return mid;
                }
                else {
                    break;
                }
            }
            else if (itemValue > midValue) {
                low = mid + 1;
            }
            else if (itemValue < midValue) {
                high = mid - 1;
            }
        }
        var index = low > mid ? mid + 1 : mid;
        this.splice(index, 0, item);
        return index;
    },
    binaryDistinct: function (keyMapper) {
        return this.filter(function (v, i, arr) { return arr.binarySearch(v, keyMapper) === i; });
    },
    findLast: function (predicate) {
        for (var i = this.length - 1; i > -1; --i) {
            if (predicate(this[i], i, this)) {
                return this[i];
            }
        }
        return undefined;
    },
    findLastIndex: function (predicate) {
        for (var i = this.length - 1; i > -1; --i) {
            if (predicate(this[i], i, this)) {
                return i;
            }
        }
        return -1;
    },
    groupBy: function (grouper) {
        var group = this.reduce(function (prev, next) {
            var groupKey = grouper(next);
            if (!prev[groupKey]) {
                prev[groupKey] = [];
            }
            prev[groupKey].push(next);
            return prev;
        }, {});
        return Object.keys(group).map(function (key) {
            var arr = group[key];
            arr.key = key;
            return arr;
        });
    },
    __k8w_extended: {
        value: true
    }
};
if (!Array.prototype.__k8w_extended) {
    for (var key in extendFuncs) {
        Object.defineProperties(Array.prototype, (_a = {},
            _a[key] = {
                value: extendFuncs[key],
                writable: true
            },
            _a));
    }
}

}, function(modId) {var map = {}; return __REQUIRE__(map[modId], modId); })
return __REQUIRE__(1667821180090);
})()
//miniprogram-npm-outsideDeps=[]
//# sourceMappingURL=index.js.map