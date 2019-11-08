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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var el = __importStar(require("./elasticsearch"));
var Page = /** @class */ (function () {
    function Page() {
    }
    return Page;
}());
var ENTITIES_INDEX = "entities";
var OC_INDEX = "cultural_objects";
var ENTITIES = "entities";
var RELATED_ENTITIES = "relatedEntities";
var RELATED_ITEMS = "relatedItems";
var FIELDS = "fields";
var TYPE_OF_ENTITY = "typeOfEntity";
var LABEL = "label";
var ID = "id";
var scriptEntityFields = "'{\"" + ID + "\":\"' + doc['" + RELATED_ENTITIES +
    "." + ID + "'].value + '\",\"" + LABEL + "\":\"' + doc['" + RELATED_ENTITIES +
    "." + LABEL + "'].value + '\", \"" + TYPE_OF_ENTITY + "\":\"' + doc['" + RELATED_ENTITIES +
    "." + TYPE_OF_ENTITY + "'].value + '\"}'";
function createFields(object) {
    var array = [];
    var _loop_1 = function (prop) {
        if (object.hasOwnProperty(prop)) {
            if (typeof object[prop] === 'string')
                array.push({ key: prop, value: object[prop] });
            else if (Array.isArray(object[prop])) {
                var obj_1 = { label: prop, fields: [] };
                object[prop].forEach(function (el) {
                    if (typeof el === 'string')
                        obj_1.fields.push(createFields(el));
                    else
                        obj_1.fields.push({ label: null, fields: createFields(el) });
                });
                array.push(obj_1);
            }
        }
    };
    for (var prop in object) {
        _loop_1(prop);
    }
    return array;
}
/**
 *
 * @param entityId entity Id to recall corresponding entity, items connected and entities related
 * @param itemsPagination object containing items pagination parameter
 * @param entitiesListSize entityList size to return
 * @returns entity details together with the items and entities related
 */
function getEntity(entityId, itemsPagination, entitiesListSize) {
    if (itemsPagination === void 0) { itemsPagination = { limit: 10000, offset: 0 }; }
    if (entitiesListSize === void 0) { entitiesListSize = 10000; }
    return __awaiter(this, void 0, void 0, function () {
        var termObject, req1, q1, quNes, script, agg, agNes, req2, entities, results;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (entityId == null || entityId === '')
                        return [2 /*return*/, null
                            //get entity by entityId
                        ];
                    termObject = {};
                    termObject[ID] = entityId;
                    req1 = el.requestBuilder(ENTITIES_INDEX, el.queryTerm(termObject));
                    //get items connected to the Entity
                    termObject = {};
                    termObject[RELATED_ENTITIES + "." + ID] = entityId;
                    q1 = el.queryTerm(termObject);
                    quNes = el.queryNested(RELATED_ENTITIES, q1);
                    script = scriptEntityFields;
                    agg = el.aggsTerms("docsPerEntity", null, script, entitiesListSize);
                    agNes = el.aggsNested(ENTITIES, RELATED_ENTITIES, agg);
                    req2 = el.requestBuilder(OC_INDEX, {
                        query: quNes.query,
                        aggs: agNes.aggs,
                        size: itemsPagination.limit,
                        from: itemsPagination.offset
                    });
                    entities = [];
                    return [4 /*yield*/, Promise.all([el.search(req1).then(function (x) {
                                var entity = x.hits.hits.length > 0 ? x.hits.hits[0]._source : null;
                                if (entity != null) {
                                    entity[FIELDS] = createFields(entity.fields);
                                }
                                return entity;
                            }), el.search(req2).then(function (x) {
                                entities = x.aggregations.entities.docsPerEntity.buckets.map(function (x) {
                                    return {
                                        entity: JSON.parse(x.key),
                                        count: x.doc_count
                                    };
                                });
                                return x.hits.hits.map(function (y) { return { item: y._source }; });
                            })])];
                case 1:
                    results = _a.sent();
                    if (results[0] == null) {
                        return [2 /*return*/, null];
                    }
                    results[0][RELATED_ITEMS] = results[1];
                    results[0][RELATED_ENTITIES] = entities;
                    return [2 /*return*/, results[0]];
            }
        });
    });
}
exports.getEntity = getEntity;
/**
 *
 * @param itemId item Id to recall corresponding item
 * @param maxSimilarItems object containing items pagination parameter
 * @param entitiesListSize entityList size to return
 */
function getItem(itemId, maxSimilarItems, entitiesListSize) {
    if (entitiesListSize === void 0) { entitiesListSize = 10000; }
    return __awaiter(this, void 0, void 0, function () {
        var request, body, hashMap_1, item, results, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (itemId == null || itemId === '')
                        return [2 /*return*/, null];
                    request = el.requestBuilder(OC_INDEX, el.queryTerm({ id: itemId }));
                    return [4 /*yield*/, el.search(request).then(function (x) { return x.hits.hits; })];
                case 1:
                    body = _a.sent();
                    if (!(body.length > 0)) return [3 /*break*/, 4];
                    hashMap_1 = {};
                    item = body[0]._source;
                    return [4 /*yield*/, Promise.all([
                            item.relatedEntities.forEach(function (x) { return hashMap_1[x.id] = x; }),
                            getItemsFiltered(null, { limit: 0, offset: 0 }, 10000).then(function (x) { return x.entitiesData; })
                        ])];
                case 2:
                    results = _a.sent();
                    results[1] = results[1].filter(function (x) { return hashMap_1[x.entity.id] != null ? true : false; }).slice(0, entitiesListSize);
                    return [4 /*yield*/, getItemsFiltered(results[1].slice(0, 2).map(function (x) { return x.entity.id; }), { limit: maxSimilarItems, offset: 0 }, 1, itemId).then(function (x) { return x.itemsPagination.items; })];
                case 3:
                    result = _a.sent();
                    item[RELATED_ENTITIES] = results[1];
                    item[RELATED_ITEMS] = result;
                    return [2 /*return*/, item];
                case 4: return [2 /*return*/, null];
            }
        });
    });
}
exports.getItem = getItem;
/**
 *
 * @param input string to search in a label field of an entity
 * @param itemsPagination object containing pagination parameter
 * @param typeOfEntity category where to searh entities with names similar to input
 */
function getEntitiesFiltered(input, itemsPagination, typeOfEntity) {
    if (itemsPagination === void 0) { itemsPagination = { limit: 10000, offset: 0 }; }
    return __awaiter(this, void 0, void 0, function () {
        var boolsArray, boolsArray2, termObject, q1, q3, q2, bools, request, q4, bools2, quNes, agg, agNes, request2, entityHashMap, res, total, results;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    boolsArray = [];
                    boolsArray2 = [];
                    if (typeOfEntity != null && typeOfEntity !== "") {
                        termObject = {};
                        termObject[TYPE_OF_ENTITY] = typeOfEntity;
                        q1 = el.queryTerm(termObject);
                        termObject = {};
                        termObject[RELATED_ENTITIES + "." + TYPE_OF_ENTITY] = typeOfEntity;
                        q3 = el.queryTerm(termObject);
                        boolsArray.push(q1.query);
                        boolsArray2.push(q3.query);
                    }
                    q2 = el.queryString({ fields: [LABEL], value: input.trim() + "*" });
                    boolsArray.push(q2);
                    bools = el.queryBool(boolsArray);
                    request = el.requestBuilder(ENTITIES_INDEX, {
                        query: bools.query,
                        size: itemsPagination.limit,
                        from: itemsPagination.offset
                    });
                    q4 = el.queryString({ fields: [RELATED_ENTITIES + "." + LABEL], value: input.trim() + "*" });
                    boolsArray2.push(q4);
                    bools2 = el.queryBool(boolsArray2);
                    quNes = el.queryNested(RELATED_ENTITIES, bools2);
                    agg = el.aggsTerms('docsPerEntity', RELATED_ENTITIES + "." + ID);
                    agNes = el.aggsNested(ENTITIES, RELATED_ENTITIES, agg);
                    request2 = el.requestBuilder(OC_INDEX, {
                        query: quNes.query,
                        aggs: agNes.aggs,
                        size: 0
                    });
                    entityHashMap = {};
                    return [4 /*yield*/, Promise.all([el.search(request).then(function (x) {
                                x.hits.hits.forEach(function (x) {
                                    entityHashMap[x._source.id] = x._source;
                                });
                                return x.hits.total;
                            }), el.search(request2).then(function (res) { return res.aggregations.
                                entities.docsPerEntity.buckets; })])];
                case 1:
                    res = _a.sent();
                    total = res[0];
                    results = [];
                    res[1].forEach(function (el) {
                        if (entityHashMap[el.key]) {
                            results.push({
                                entity: entityHashMap[el.key],
                                count: el.doc_count
                            });
                        }
                    });
                    return [2 /*return*/, { totalCount: total, entities: results }];
            }
        });
    });
}
exports.getEntitiesFiltered = getEntitiesFiltered;
/**
 *
 * @param entityIds entities to filter the items connected to them
 * @param itemsPagination object containing pagination parameter
 * @param entitiesListSize entityList size to return
 */
function getItemsFiltered(entityIds, itemsPagination, entitiesListSize, itemIdToDiscard) {
    if (itemsPagination === void 0) { itemsPagination = { limit: 10000, offset: 0 }; }
    if (entitiesListSize === void 0) { entitiesListSize = 10000; }
    if (itemIdToDiscard === void 0) { itemIdToDiscard = null; }
    return __awaiter(this, void 0, void 0, function () {
        var script, agg, agNes, source, scFi, body, entities, _i, entityIds_1, entityId, termObject, request, res, buckets, typesOfEntity, results, typeOfEntityData, prop;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    script = scriptEntityFields;
                    agg = el.aggsTerms("docsPerEntity", null, script, entitiesListSize);
                    agNes = el.aggsNested('entities', RELATED_ENTITIES, agg);
                    source = "def list = new HashMap(); for (type in params['_source']." + RELATED_ENTITIES + ") { def key = type." + TYPE_OF_ENTITY + "; if(list[key] != null){list[key]['count']++;} else { list[key] = new HashMap(); list[key]['count'] = 1; list[key]['type'] = type." + TYPE_OF_ENTITY + "; }} return list;";
                    scFi = el.scriptFields('typeOfEntitiesCount', source);
                    body = {
                        aggs: agNes.aggs, script_fields: scFi.script_fields,
                        stored_fields: ["_source"],
                        size: itemsPagination.limit,
                        from: itemsPagination.offset
                    };
                    entities = [];
                    if (entityIds != null && entityIds.length > 0) {
                        for (_i = 0, entityIds_1 = entityIds; _i < entityIds_1.length; _i++) {
                            entityId = entityIds_1[_i];
                            termObject = {};
                            termObject[RELATED_ENTITIES + "." + ID] = entityId;
                            entities.push(el.queryNested(RELATED_ENTITIES, el.queryTerm(termObject)).query);
                        }
                        body['query'] = el.queryBool(entities).query;
                    }
                    request = el.requestBuilder(OC_INDEX, body);
                    return [4 /*yield*/, el.search(request)];
                case 1:
                    res = _a.sent();
                    buckets = res.aggregations.entities.docsPerEntity.buckets;
                    typesOfEntity = {};
                    return [4 /*yield*/, Promise.all([
                            res.hits.hits.filter(function (x) { return x._source.id === itemIdToDiscard ? false : true; }).map(function (x) {
                                var list = [];
                                var object = x.fields.typeOfEntitiesCount[0];
                                for (var prop in object) {
                                    if (object.hasOwnProperty(prop)) {
                                        list.push(object[prop]);
                                    }
                                }
                                var res = {
                                    item: x._source,
                                    relatedTypesOfEntity: list
                                };
                                return res;
                            }),
                            buckets.map(function (x) {
                                var entity = JSON.parse(x.key);
                                if (typesOfEntity[entity.typeOfEntity] == null)
                                    typesOfEntity[entity.typeOfEntity] = { type: entity.typeOfEntity, count: 0 };
                                typesOfEntity[entity.typeOfEntity].count++;
                                return {
                                    entity: entity,
                                    count: x.doc_count
                                };
                            }),
                        ])];
                case 2:
                    results = _a.sent();
                    typeOfEntityData = [];
                    for (prop in typesOfEntity) {
                        if (typesOfEntity.hasOwnProperty(prop)) {
                            typeOfEntityData.push(typesOfEntity[prop]);
                        }
                    }
                    return [2 /*return*/, { itemsPagination: { items: results[0], totalCount: res.hits.total }, typeOfEntityData: typeOfEntityData, entitiesData: results[1] }];
            }
        });
    });
}
exports.getItemsFiltered = getItemsFiltered;
function search(searchParameters) {
    var facets = {};
    var filters = searchParameters.filters;
    searchParameters.facets.forEach(function (facet) {
        facets[facet.id] = facet;
    });
    filters.forEach(function (filter) {
        if (filter.value != null || filter.facetId === "query-all") {
            var facet = facets[filter.facetId];
            var request = {};
            switch (filter.facetId) {
                case "query":
                    var searchIn = filter.searchIn[0];
                    var term = filter.value; // searchIn.operator === "LIKE" ? filter.value + "*" ? searchIn.operator === "=" : filter.value + "*" : filter.value + "*"
                    request['query'] = el.queryTerm({ "${searchIn.key}": term });
                    break;
                case "query-all":
                    searchIn = filter.searchIn[0];
                    term = filter.value; // searchIn.operator === "LIKE" ? filter.value + "*" ? searchIn.operator === "=" : filter.value + "*" : filter.value + "*"
                    request["query"] = el.queryBool([el.queryNested(RELATED_ENTITIES, el.queryString({ fields: ["relatedEntities.*"], value: term })).query,
                        el.queryString({ fields: ["*"], value: term })]).query;
                    break;
                case "query-links":
                    break;
                case "entity-links":
                    break;
            }
        }
    });
}
exports.search = search;
