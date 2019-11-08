"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var elasticsearch_1 = require("@elastic/elasticsearch");
var elasticConfig_1 = require("./elasticConfig");
var client = new elasticsearch_1.Client({ node: elasticConfig_1.elasticNodeAddress, auth: elasticConfig_1.elasticAuth, ssl: { rejectUnauthorized: false } });
/**
 *
 * @param request http body request for elasticsearch query
 */
function search(request) {
    return __awaiter(this, void 0, void 0, function () {
        var res;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, client.search(request)];
                case 1:
                    res = (_a.sent()).body;
                    return [2 /*return*/, res];
            }
        });
    });
}
exports.search = search;
/**
 *
 * @param index index name
 * @param body http body for a query request
 */
exports.requestBuilder = function (index, body) {
    var x = {
        index: index,
        body: body
    };
    return x;
};
/*get the path and a generic query and return a nested query block*/
/**
 *
 * @param path path to reace the nested field
 * @param query query to apply on a nested object field
 */
exports.queryNested = function (path, query) {
    var x = {
        query: {
            nested: {
                path: path,
                query: query.query
            }
        }
    };
    return x;
};
/**
 *
 * @param field field name
 * @param script script to generate a script field
 */
exports.scriptFields = function (field, script) {
    var x = {
        script_fields: {}
    };
    x.script_fields[field] = {
        script: {
            source: script
        }
    };
    return x;
};
/**
 *
 * @param buckets buckets name
 * @param path path of a nested field
 * @param aggs aggs block to apply on a nested object field
 */
exports.aggsNested = function (buckets, path, aggs) {
    var x = {
        aggs: {}
    };
    x.aggs[buckets] = {
        nested: {
            path: path,
        },
        aggs: aggs.aggs
    };
    return x;
};
/**
 *
 * @param buckets buckets name
 * @param field field to aggregate
 * @param script script to aggregate field in a custom way
 * @param size max number of buckets returned
 */
exports.aggsTerms = function (buckets, field, script, size) {
    if (field === void 0) { field = null; }
    if (script === void 0) { script = null; }
    if (size === void 0) { size = 10000; }
    var x = {
        aggs: {}
    };
    x.aggs[buckets] = {
        terms: {
            min_doc_count: 1,
            size: size,
        }
    };
    if (field != null)
        x.aggs[buckets].terms['field'] = field;
    if (script != null)
        x.aggs[buckets].terms['script'] = script;
    return x;
};
/**
 *
 * @param mustList list of query blocks to insert in multi-conditions block
 */
exports.queryBool = function (mustList, shouldList, filterList, notList) {
    if (mustList === void 0) { mustList = []; }
    if (shouldList === void 0) { shouldList = []; }
    if (filterList === void 0) { filterList = []; }
    if (notList === void 0) { notList = []; }
    var x = {
        query: {
            bool: {
                must: mustList,
                should: shouldList,
                filter: filterList,
                must_not: notList
            }
        }
    };
    return x;
};
/**
 *
 * @param queryField object containing the field name and the value to search on it
 */
exports.queryString = function (queryField) {
    var x = {
        query_string: {
            query: queryField.value,
            fields: queryField.fields
        }
    };
    return x;
};
/**
 *
 * @param termField object containing the field name as key and the field value to search as the value
 */
exports.queryTerm = function (termField) {
    return {
        query: {
            term: termField
        }
    };
};
