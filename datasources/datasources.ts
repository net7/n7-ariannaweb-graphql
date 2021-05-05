import * as el from "./elasticsearch"
import { response } from "express"
import { mapValues } from "apollo-env"
import * as config from '../assets/app-config.json';
import 'apollo-cache-control';
//const config = {};
class Page {
  offset: number
  limit: number
}
const TREE_INDEX = config['index']['treeIndex'] || "tree";
const TREE_SIZE = config['treeSize'] || 35000;
const GLOBAL_INDEX = config['index']['globalIndex'] || "global"
const ENTITIES_INDEX = config['index']['entitiesIndex'] || "entities"
const OC_INDEX = config['index']['ocIndex'] || "cultural_objects"
const ENTITIES = "entities"
const RELATED_ENTITIES = "relatedEntities"
const RELATED_ITEMS = "relatedItems"
const TYPE_OF_ENTITY = "typeOfEntity"
const LABEL = "label"
const LABEL_NGRAMS = "label.ngrams"
const ID = "id"
const CHILDREN = "branches"
const LEVEL = "level"
const POSITION = "position"
const RELATION = "relation"

const scriptEntityFieldsGlobal = "'{\"" + ID + "\":\"' + doc['" + RELATED_ENTITIES +
  "." + ID + "'].value + '\",\"" + LABEL + "\":\"' + doc['" + RELATED_ENTITIES +
  "." + LABEL + ".keyword'].value.replace('\u0022', '') + '\", \""
  + TYPE_OF_ENTITY + "\":\"' + doc['" + RELATED_ENTITIES +
  "." + TYPE_OF_ENTITY + "'].value + '\"}'"

const scriptEntityFields = "'{\"" + ID + "\":\"' + doc['" + RELATED_ENTITIES +
  "." + ID + "'].value + '\",\"" + LABEL + "\":\"' + doc['" + RELATED_ENTITIES +
  "." + LABEL + ".keyword'].value.replace('\u0022', '') + '\", \""
  + RELATION + "\":\"' + doc['" + RELATED_ENTITIES + "." + RELATION + ".keyword'].value.replace('\"', '\\\\\u0022') + '\", \""
  + TYPE_OF_ENTITY + "\":\"' + doc['" + RELATED_ENTITIES +
  "." + TYPE_OF_ENTITY + "'].value + '\"}'"

function makeItemListing(item: any, entityId: string = "") {
  let object = {}
  let entities = item[RELATED_ENTITIES]
  var relation = "";
  if (entities != null)
    //count number of types of Entity
    entities.forEach(entity => {
      if (!object[entity[TYPE_OF_ENTITY]]) {
        object[entity[TYPE_OF_ENTITY]] = {
          count: 0,
          type: entity[TYPE_OF_ENTITY]
        }
      }
      object[entity[TYPE_OF_ENTITY]].count += 1
      relation = entityId === entity.id ? entity.relation : relation;
    })
  var list = []
  for (const prop in object) {
    if (object.hasOwnProperty(prop)) {
      list.push(object[prop])
    }
  }
  const res = {
    item: item,
    relatedTypesOfEntity: list,
    relation: relation
  }
  return res
}

export async function getRelations(entityId: string, itemsPagination: Page = { limit: 10000, offset: 0 }, entitiesListSize: number) {
  //get items connected to the Entity
  const termObject = {}
  termObject[RELATED_ENTITIES + "." + ID] = entityId
  const q1 = el.queryTerm(termObject)
  const quNes = el.queryNested(RELATED_ENTITIES, q1)
  const script = scriptEntityFields
  //const agg = el.aggsTerms("docsPerEntity", null, script, entitiesListSize)
  //const agNes = el.aggsNested(ENTITIES, RELATED_ENTITIES, agg)

  const req = el.requestBuilder(OC_INDEX, {
    "sort": {
      "label.keyword": { "order": "asc" }
    },
    query: quNes.query,
    //	aggs: agNes.aggs,
    size: itemsPagination.limit,
    from: itemsPagination.offset
  })
  var entities = []
  const items = await el.search(req).then(x => {
		/*entities = x.aggregations.entities.docsPerEntity.buckets.map(x => {
			return {
				entity: JSON.parse(x.key),
				count: x.doc_count
			}
		}).filter(x => x.entity.id !== entityId)*/

    return {
      total: x.hits.total,
      items :  x.hits.hits.map(y => { return makeItemListing(y._source, entityId) })
    }
    
  })
  return items;
}
export async function getRelationsAl(entityId: string, itemsPagination: Page = { limit: 10000, offset: 0 }, entitiesListSize: number) {
  //get items connected to the Entity
  const termObject = {}
  termObject[RELATED_ENTITIES + "." + ID] = entityId
  const q1 = el.queryTerm(termObject)
  const quNes = el.queryNested(RELATED_ENTITIES, q1)
  const termAl = {"document_type" : "aggregazione-logica"}
  const q2 = el.queryTerm(termAl)

  const queryBool = el.queryBool([quNes.query,q2.query]);

  const req = el.requestBuilder(GLOBAL_INDEX, {
    "sort": {
      "label.keyword": { "order": "asc" }
    },
    query: queryBool.query,
    //	aggs: agNes.aggs,
    size: itemsPagination.limit,
    from: itemsPagination.offset
  })
  var entities = []
  const items = await el.search(req).then(x => {
   // return x.hits.hits.map(y => { return makeItemListing(y._source, entityId) })
   return {
      total: x.hits.total,
      items:  x.hits.hits.map(y => { return makeItemListing(y._source, entityId) })
    }

  })

  return items;
}

/**
 *
 * @param entityId entity Id to recall corresponding entity, items connected and entities related
 * @param itemsPagination object containing items pagination parameter
 * @param entitiesListSize entityList size to return
 * @returns entity details together with the items and entities related
 */
export async function getEntity(entityId: string, itemsPagination: Page = { limit: 10000, offset: 0 }, entitiesListSize: number = 10000) {
  if (entityId == null || entityId === '')
    return null

  //get entity by entityId
  const termObject = {}
  termObject[ID] = entityId
  const req1 = el.requestBuilder(ENTITIES_INDEX, el.queryTerm(termObject))

  const results = await Promise.all([el.search(req1).then(x => {
    let entity = x.hits.hits.length > 0 ? x.hits.hits[0]._source : null
    return entity
  })
  ])

  if (results[0] == null) {
    return null
  }

    const response = await this.getRelations(entityId, itemsPagination, entitiesListSize);
    const response2 = await this.getRelationsAl(entityId, itemsPagination, entitiesListSize);
   // item['relatedItemsTotalCount'] = response.total;

  results[0].params = {
    'relatedItems': response,
    'relatedAl': response2
  }
  
  return results[0]
}

/**
 *
 * @param itemId item Id to recall corresponding item
 * @param maxSimilarItems object containing items pagination parameter
 * @param entitiesListSize entityList size to return
 */
export async function getItem(itemId: string, maxSimilarItems: number = 10000, entitiesListSize: number = 10000) {
  if (itemId == null || itemId === '')
    return null

  const request = el.requestBuilder(OC_INDEX, el.queryTerm({ id: itemId }))
  const body = await el.search(request).then(x => x.hits.hits)

  if (body.length > 0) {
    let item = body[0]._source;
		/*const hashMap = {}
		const results = await Promise.all([
      item.relatedEntities != null ? item.relatedEntities.forEach(x => hashMap[x.id] = x) : null,
			getItemsFiltered(null, { limit: 1, offset: 0 }, 10000).then(x => x.entitiesData)
    ])

    results[1] = results[1]
    .filter(x => hashMap[x.entity.id] != null)
    .map(x => { x[RELATION] = hashMap[x.entity.id][RELATION]; return x; } )
    .slice(0, entitiesListSize)*/
    const relatedEntitiesIds = [];
    if (item.relatedEntities != null) {
      item.relatedEntities.forEach(x => relatedEntitiesIds.push(x.id))

      //return items related with first three related entities of the object
      /* const result = await getItemsFiltered(relatedEntitiesIds.slice(0, 2),
         { limit: maxSimilarItems, offset: 0 }, 1, itemId).then(x => x.itemsPagination.items)
       item[RELATED_ITEMS] = result*/

      item.params = {
        'maxSimilarItems': maxSimilarItems,
        'entitiesListSize': entitiesListSize
      }
    }

    item.index = "oc_index";
    return item
  } else {
    const request2 = el.requestBuilder(TREE_INDEX, el.queryTerm({ id: itemId }))
    const body = await el.search(request2).then(x => x.hits.hits)
    if (body.length > 0) {
      let item = body[0]._source;
      item.index = "tree_index";
      if (!item.title) {
        item['title'] = item.label;
      }
      return item
    }
  }
  return null;
}

/**
 * Resolver for Autocomplete Apollo query
 * @param input string to search in a label field of an entity
 * @param itemsPagination object containing pagination parameter
 * @param typeOfEntity category where to searh entities with names similar to input
 */
export async function getEntitiesFiltered(input: string, itemsPagination: Page = { limit: 10000, offset: 0 }, typeOfEntity: string) {

  const boolsArray = []
  const boolsArray2 = []
  let aggr1 = {};

  const highlight = { fields: {} };
  highlight.fields[LABEL_NGRAMS] = {
    "type": "fvh",
    "fragment_offset": 0
  };
  highlight.fields[LABEL] = {};

  if (typeOfEntity != null && typeOfEntity !== "") {
    var termObject = {}
    termObject[TYPE_OF_ENTITY] = typeOfEntity
    const q1 = el.queryTerm(termObject)
    termObject = {}
    termObject[RELATED_ENTITIES + "." + TYPE_OF_ENTITY] = typeOfEntity
    const q3 = el.queryTerm(termObject)
    boolsArray.push(q1.query)
    boolsArray2.push(q3.query)
  } else {
    aggr1 = el.aggsTerms("type", DOCUMENT_TYPE, null, 10000, 0).aggs;
    aggr1["type"]['aggs'] = el.topHits("hits", itemsPagination.limit, itemsPagination.offset, null, 1, highlight).aggs;
  }

  //const filter = el.queryString({ fields: [LABEL], value: el.buildQueryString(input, { allowWildCard: true }) });
  const term = el.buildQueryString(input, { allowWildCard: false, stripDoubleQuotes: true, allowFuzziness: false })
  const should = el.queryString({ fields: [LABEL], value: el.buildQueryString(input, { allowWildCard: true, stripDoubleQuotes: true }).substring(1) }, 'AND', 3.5);
  const q2 = el.queryString({ fields: [LABEL_NGRAMS, LABEL], value: el.buildQueryString(input, { allowWildCard: false, stripDoubleQuotes: true, allowFuzziness: true }) })
  boolsArray.push(q2);
  boolsArray.push(
    {
      "function_score": {
        "script_score": {
          "script": "if(doc['label_sort.keyword'].size() > 0 ){int index = doc['label_sort.keyword'].value.indexOf('" + term + "');"
            + "if(index === 0){ 5 } else { Math.pow(0.8, index) }} else {1}"
        },
        "boost_mode": "multiply"
      }
    }
  );
  const bools = el.queryBool(boolsArray, should)
  const request = el.requestBuilder(GLOBAL_INDEX, {
    query: bools.query,
    size: itemsPagination.limit,
    from: itemsPagination.offset,
    aggs: aggr1

  })

  const q4 = el.queryString({ fields: [RELATED_ENTITIES + "." + LABEL], value: input.trim() + "*" })
  boolsArray2.push(q4)
  const bools2 = el.queryBool(boolsArray2)
  const quNes = el.queryNested(RELATED_ENTITIES, bools2)
  const agg = el.aggsTerms('docsPerEntity', RELATED_ENTITIES + "." + ID)
  const agNes = el.aggsNested(ENTITIES, RELATED_ENTITIES, agg)

  //query to recover the related entities for each cultural object
  const request2 = el.requestBuilder(OC_INDEX, {
    query: quNes.query,
    aggs: agNes.aggs,
    size: 0
  })

  const entityHashMap = {}
  var total = 0;
 // console.log(JSON.stringify(request))
  const res = await Promise.all(
    [el.search(request).then(x => {
      total = x.hits.total
      let results = [];
      if (x.aggregations) {
        x.aggregations.type.buckets.map(bucket => {
          bucket.hits.hits.hits.forEach(element => {
            if (element.highlight) {
              element._source.highlight = element.highlight;
            }
            results.push(element._source);
          });
        }
        )
        return results;
      } else {
        return x.hits.hits.map(x => {
          x._source.highlight = x.highlight;
          return x._source;
        })
      }
    }), el.search(request2).then(res => {
      res.aggregations.
      entities.docsPerEntity.buckets.forEach(el => {
        entityHashMap[el.key] = el.doc_count;
      })
    }
    )])
  const results = []
  res[0].forEach(el => {
    if (el.parent_type == "entity") {
      if (entityHashMap[el.id]) {
        results.push({
          entity: el,
          count: entityHashMap[el.id]
        })
      } else {
        results.push({
          entity: el,
          count: 0
        })
      }
    } else {
      results.push({ item: el })
    }
  });

  return { totalCount: total, results: results }
}

/**
 * resolver for globalFilter query
 * @param entityIds entities to filter the items connected to them
 * @param itemsPagination object containing pagination parameter
 * @param entitiesListSize entityList size to return
 */
export async function getItemsFiltered(entityIds, itemsPagination: Page = { limit: 10, offset: 0 }, entitiesListSize: number = 10000, itemIdToDiscard: string = null) {

  const agg = el.aggsTerms("docsPerEntity", null, scriptEntityFieldsGlobal, entitiesListSize)

  agg["aggs"]["docsPerEntity"]['aggs'] = {
        "cultural_objects" : {
          "reverse_nested": {},
          "aggs": {
              "culturalObjects": {
                  "terms": {
                      "min_doc_count": 1,
                      "size": 10,
                      "field": "id"
                  }
              }
          }
        }
      };


  let aggsEntity = el.aggsTerms("entities", 'relatedEntities.typeOfEntity');
  aggsEntity.aggs['entities']['aggs'] = agg.aggs;

  aggsEntity.aggs['entities']['aggs']['distinctTerms'] = { "cardinality": {
    "field": RELATED_ENTITIES + "." + ID
  }};
  let agNes = el.aggsNested(ENTITIES, RELATED_ENTITIES, aggsEntity)
  let aggr1 = el.globalAggsTerms("type", "typeOfEntity", 10000, null, 0);

	const body = {
		aggs: {
      [ENTITIES]: agNes.aggs[ENTITIES], 
      "type": aggr1.aggs['type']
    },

		//		script_fields: scFi.script_fields,
		"_source": [],
		size: itemsPagination.limit,
    from: itemsPagination.offset,
    sort: [{"label_sort.keyword": {"order": "asc"}}]
  }
  //body["aggs"]["hits"] = topHitsNested;

  const entities = []
  const excludeQuery = [{
    "term": {
        "parent_type": "entity"
    }
  }];

	if (entityIds != null && entityIds.length > 0) {
		for (const entityId of entityIds) {
			const termObject = {}
			termObject[RELATED_ENTITIES + "." + ID] = entityId
			entities.push(el.queryNested(RELATED_ENTITIES, el.queryTerm(termObject)).query)
		}
	}
  body[QUERY] = el.queryBool(entities, null, null, excludeQuery).query

  const request = el.requestBuilder(GLOBAL_INDEX, body)
 // console.log("GLOBAL FILTER", JSON.stringify( body));
	const res = await el.search(request)
  const buckets = res.aggregations[ENTITIES][ENTITIES].buckets;
  const entitiesCount = {};  
  let entitiesList = [];
  let typeOfEntityData = [];

  res.aggregations["type"].buckets.buckets.map( x => {
    entitiesCount[x.key] = x.doc_count;
  });

	const results = await Promise.all([
		res.hits.hits.filter(x => !(x._source.id === itemIdToDiscard)).map(x => makeItemListing(x._source)),

    buckets.forEach(element => {
      typeOfEntityData.push({
        type: element.key,
        count: entitiesCount[element.key]
      });
      element.docsPerEntity.buckets.map(x => {
        try {
        let entity = JSON.parse(x.key)
        entitiesList.push(
           {
            entity: entity,
            count: x.cultural_objects.doc_count
          }
        )
        } catch (error) {
          console.error(error);
        }
      })

    })
  ])

  entitiesList.sort(function(a, b){
    if(a.count < b.count) return 1;
    if(a.count > b.count) return -1;
    return 0;
});

	return {
    itemsPagination: { items: results[0], totalCount: res.hits.total },
    typeOfEntityData: typeOfEntityData,
    entitiesData: entitiesList
  };
}

/**
 * resolver for globalFilter query
 * @param entityIds entities to filter the items connected to them
 * @param itemsPagination object containing pagination parameter
 * @param entitiesListSize entityList size to return
 */
export async function getRelatedItems(entityIds, itemsPagination: Page = { limit: 10, offset: 0 }, entitiesListSize: number = 10000, itemIdToDiscard: string = null) {

  const agg = el.aggsTerms("docsPerEntity", null, scriptEntityFieldsGlobal, entitiesListSize)

  agg["aggs"]["docsPerEntity"]['aggs'] = {
    "cultural_objects": {
      "reverse_nested": {},
      "aggs": {
        "culturalObjects": {
          "terms": {
            "min_doc_count": 1,
            "size": 10,
            "field": "id"
          }
        }
      }
    }
  };


  let aggsEntity = el.aggsTerms("entities", 'relatedEntities.typeOfEntity');
  aggsEntity.aggs['entities']['aggs'] = agg.aggs;

  aggsEntity.aggs['entities']['aggs']['distinctTerms'] = {
    "cardinality": {
      "field": RELATED_ENTITIES + "." + ID
    }
  };
  let agNes = el.aggsNested(ENTITIES, RELATED_ENTITIES, aggsEntity)
  let aggr1 = el.aggsTerms("type", "relatedEntities.typeOfEntity", null, 10000, 0).aggs;

  const body = {
    aggs: agNes.aggs,

    //		script_fields: scFi.script_fields,
    "_source": [],
    size: itemsPagination.limit,
    from: itemsPagination.offset,
    sort: [{ "label_sort.keyword": { "order": "asc" } }]
  }
  //body["aggs"]["hits"] = topHitsNested;

  const entities = []
  if (entityIds != null && entityIds.length > 0) {
    for (const entityId of entityIds) {
      const termObject = {}
      termObject[RELATED_ENTITIES + "." + ID] = entityId
      entities.push(el.queryNested(RELATED_ENTITIES, el.queryTerm(termObject)).query)
    }
    body[QUERY] = el.queryBool(entities).query
  }

  const request = el.requestBuilder(OC_INDEX, body)
  //console.log("GLOBAL FILTER", JSON.stringify( body));
  const res = await el.search(request)
  const buckets = res.aggregations[ENTITIES][ENTITIES].buckets;
  const typesOfEntity = {};
  let entitiesList = [];
  let typeOfEntityData = [];

  const results = await Promise.all([
    res.hits.hits.filter(x => !(x._source.id === itemIdToDiscard)).map(x => makeItemListing(x._source)),
  ])

  entitiesList.sort(function (a, b) {
    if (a.count < b.count) return 1;
    if (a.count > b.count) return -1;
    return 0;
  });

  return {
    itemsPagination: { items: results[0], totalCount: res.hits.total }
  };
}


export async function getEntityRelatedItemsCount(entityIds, itemsPagination: Page = { limit: 10, offset: 0 }, entitiesListSize: number = 10000, itemIdToDiscard: string = null) {

  const aggs = {
    "aggs": {
      "entities": {
        "filter": {
          "terms": {
            "relatedEntities.id": entityIds
          }
        },
        "aggs": {
          "typeOfEntity": {
            "terms": {
              "min_doc_count": 1,
              "size": entityIds.length,
              "field": "relatedEntities.id"
            },
            "aggs": {
              "cultural_objects": {
                "reverse_nested": {}

              }
            }
          }
        }

      },
    }
  };

  let agNes = el.aggsNested(ENTITIES, RELATED_ENTITIES, aggs)

  const body = {
    aggs: agNes.aggs,

    //		script_fields: scFi.script_fields,
    "_source": [],
    size: itemsPagination.limit,
    from: itemsPagination.offset,
    sort: [{ "label_sort.keyword": { "order": "asc" } }]
  }

  const request = el.requestBuilder(GLOBAL_INDEX, body)
  //console.log("GLOBAL FILTER", JSON.stringify( body));
  const res = await el.search(request)
 // const buckets = res.aggregations[ENTITIES][ENTITIES]["typeOfEntity"].buckets;

  const results = await Promise.all([ res.aggregations[ENTITIES][ENTITIES]["typeOfEntity"].buckets ])

  return results[0];
}


function buildTree(node: any, nodeList): any {
  node[CHILDREN] = []
  while (nodeList.length > 0 && nodeList[0][LEVEL] > node[LEVEL]) {
    node[CHILDREN].push(buildTree(nodeList.shift(), nodeList))
  }
  return node
}

export async function getTree(info) {
  const query = {
    query: {
      match_all: {}
    },
    sort: {
    },
    size: TREE_SIZE //ATTENZIONE: size >= numero documenti sull'indice tree && size <= max_results_window
  }
  query.sort[POSITION] = { "order": "asc" }
  const request = el.requestBuilder(TREE_INDEX, query)

  var res = await el.search(request)
  res = res.hits.hits.map(x => x._source)
  const root = res.shift()
  const tree = buildTree(root, res)
  return tree
}

export async function getNode(id: string, maxSimilarItems: number, entitiesListSize: number) {
  const results = await Promise.all([getItem(id, maxSimilarItems, entitiesListSize)])
  return results[0];
  //return results[1] != null ? results[1] : results[0].hits.hits.length > 0 ? results[0].hits.hits[0]._source : null
}

/**
 * Search section: constants and functions
 */

const QUERY = "query"
const QUERY_ALL = "query-all"
const QUERY_LINKS = "query-links"
const QUERY_LINKS_FILTER_FACETS = "query-links-filter-facets"
const ENTITY_LINKS = "entity-links"
const ACTIVE_ENTITY_LINKS = "active-entity-links"
const ENTITY_TYPES = "entity-types"
const ENTITY_SEARCH = "entity-search"
const RESOURCE_ID = "resource-id"
const DOC_CLASSIFICATION = "doc-classification"

const AGGS = "aggs"
const AGGS_NESTED_FIELD = "entities"
const AGG_FIELD = "docs_per_doctype"
const NESTED_FIELD = "relatedEntities"
const KEYWORD = "keyword"
const ALL_FIELDS = "*"
const BOOL = 'bool'
const FILTER = 'filter'
const SHOULD = 'should'
const MUST = "must"

const DOCUMENT_TYPE = "document_type"
const DOCUMENT_CLASSIFICATION = "fields.document_classification.keyword"
const OC = "oggetto-culturale"

async function makeElement(element: any) {
  if (element[DOCUMENT_TYPE] === OC) {
    return makeItemListing(element)
  } else {
    return element
  }
}

export async function search(searchParameters: any) {
  
  const facets = searchParameters.facets
  const filters = {}
  searchParameters.filters.forEach(filter => {
    filters[filter.facetId] = filter
  })

  const result = await elasticSearch(searchParameters);  
  let elements = [];
  const items = result.hits.hits.map(x => {
    x._source.highlight = x.highlight;
    elements.push(x._source)
  });

  if (result.aggregations) {

    facets.forEach((facet, index) => {

      if( facet.id == QUERY_LINKS_FILTER_FACETS) {
        facets.splice(index, 1);
      } 

      if (result.aggregations[facet.id] != null && !facet.data) {
        switch (facet.id) {
          case QUERY_LINKS:
            let data = result.aggregations[facet.id].buckets.map(bucket => {
              return {
                "value": bucket.key,
                "label": bucket.key,
                "counter": bucket.doc_count
              };
            });
            facet.data = data;
            break;
          case ENTITY_TYPES:
            let data2 = result.aggregations[facet.id]['all_entities']['buckets'].buckets.map(bucket => {
              return {
                "value": bucket.key,
                "label": bucket.key,
                "counter": bucket.doc_count
              };
            });
            facet.data = data2;
            break;
          case ENTITY_LINKS: {
            const offset = ( filters[ENTITY_LINKS].pagination != undefined ) ? filters[ENTITY_LINKS].pagination.offset : 0;
            const data_offset = result.aggregations[facet.id][facet.id][facet.id][facet.id]['buckets'].slice(offset);
            let data3 = data_offset.map(bucket => {
              return {
                "value": bucket.key,
                "label": bucket[facet.id + "_label"].buckets[0].key,
                "counter": bucket.doc_count,
                "searchData": facet.searchData.map(y => {
                  return {
                    key: y,
                    value: bucket[facet.id]['buckets'].map(x => x.key)
                  }
                })
              };
            });

            if(data3.length <= 0 && result.aggregations[ACTIVE_ENTITY_LINKS]){
              const data_active = result.aggregations[ACTIVE_ENTITY_LINKS][ACTIVE_ENTITY_LINKS][ACTIVE_ENTITY_LINKS]['buckets'];
              data3 = data_active.map(bucket => {
                return {
                    "value": bucket.key,
                    "label": bucket[facet.id + "_label"].buckets[0].key,
                    "counter": 0,
                    "searchData": facet.searchData.map(y => {
                      return {
                        key: y,
                        value: bucket[facet.id]['buckets'].map(x => x.key)
                      }
                    })
                  };
                });
            }            

            facet.data = data3;
            facet.totalCount = result.aggregations[facet.id][facet.id][facet.id]['distinctTerms'].value
            break;
          }
          case DOC_CLASSIFICATION: {
            let data4 = result.aggregations[facet.id]['buckets'].buckets.map(bucket => {
              return {
                "value": bucket.key,
                "label": bucket.key,
                "counter": bucket.doc_count
              };
            });
            facet.data = data4;
            break;
          }
        }
      }
    });
  }

  searchParameters.results.items = elements;
  let response = {
    totalCount: result.hits.total,
    filters: searchParameters.filters,
    facets: searchParameters.facets,
    results: searchParameters.results
  }
  return response;
}

export async function elasticSearch( searchParameters ) {

  const facets = searchParameters.facets
  const filters = {}
  searchParameters.filters.forEach(filter => {
    filters[filter.facetId] = filter
  })

  let aggregations = [];
  // request for global index
  let body = {}

  // request for entity types filter
  let etFilter = el.queryBool([], []);

  if (searchParameters.page.limit) {
    body["size"] = searchParameters.page.limit
  }
  if (searchParameters.page.offset) {
    body["from"] = searchParameters.page.offset
  }

  let order = {};

  if (searchParameters.results.order) {
    let key = searchParameters.results.order.key;

    if (searchParameters.results.order.type == "text") {
      key += ".keyword";
      order[key] = { "order": searchParameters.results.order.direction };

    }
    else {
      order[key] = { "order": searchParameters.results.order.direction };
      order["label_sort.keyword"] = { "order": "ASC" }; //aggiungo un secondo criterio di ordinamento
    }

    body["sort"] = [order];
  }

  let highlight = { "fields": {}, "fragment_size": 500 };

  facets.forEach(facet => {
    const filter = filters[facet.id]
    switch (facet.id) {
      case QUERY:
        // query full text
        if (filter && filter.value && filter.value != "") {
          let searchIn = filter.searchIn[0]
          let searchInkey = searchIn.key.split(",");
          let query_filter = [];  
          let should_filter:any;       
          let term = el.buildQueryString(filter.value[0], { allowWildCard: false, stripDoubleQuotes: true, allowFuzziness: false }) // searchIn.operator === "LIKE" ? filter.value + "*" ? searchIn.operator === "=" : filter.value + "*" : filter.value + "*"

          if (filters[QUERY_ALL].value == true) {
            searchInkey = filters[QUERY_ALL].searchIn[0].key == "query-all" ? ["*"] : filters[QUERY_ALL].searchIn[0].key.split(","); // ["label^5", "text^4", "fields.*^3"];
          }

          searchIn.key.split(",").forEach(element => {
            if (element.indexOf(".ngrams") >= 0) {
              const baseField = element.substring(0, element.indexOf(".ngrams"));
              query_filter.push(
                el.queryString({ fields: [baseField], value: el.buildQueryString(filter.value[0], { allowWildCard: true }) })
              )

            should_filter = el.queryString({ fields: [baseField], value: el.buildQueryString(filter.value[0], { allowWildCard: false })}, 'AND', 3.5)
              
            highlight.fields[baseField] = {};
            highlight.fields[element] = {
                "type": "fvh",
                "fragment_offset": 0
              };
            } else {
              highlight.fields[element] = {}
            }

          });


          /* let bools = el.queryBool(
               [el.queryString({ fields: searchInkey, value: term })],
               should_filter,
               query_filter
             ).query*/
          let score_term =  el.buildQueryString(filter.value[0], { allowWildCard: false, stripDoubleQuotes: true, allowFuzziness: true });
          const should_query = [
            el.queryString({ fields: searchInkey, value: score_term }),
            {
              "function_score": {
                "query": {
                  "query_string": el.queryString({ fields: searchInkey, value: term }).query_string
                },
                "script_score": {
                  "script": "if(doc['label_sort.keyword'].size() > 0 ) {int index = doc['label_sort.keyword'].value.indexOf('" + term + "');"
                    + "if(index === 0){ 3 } else { Math.pow(0.8, index)}} else {1}"
                },
                "boost_mode": "multiply"
              }
            },
          //  should_filter
          ];

          let bools1 = el.queryBool(
            [],
            should_query,
            []
          ).query

          etFilter[QUERY][BOOL][MUST] = bools1.bool.should.slice();

          if (body[QUERY] == null){
            body[QUERY] = {},
            body[QUERY][BOOL] = {};
            body[QUERY][BOOL][MUST] = [];
            body[QUERY][BOOL][MUST].push(
              {
                "bool": {
                  "should": bools1.bool.should
                }
              }
            );
          }
          else if (body[QUERY][BOOL] == null)
            body[QUERY][BOOL] = bools1.bool
          else
            body[QUERY][BOOL][MUST] = bools1.bool.must

        }
      break      
      case QUERY_LINKS: //search for resources typology
        if (filter && filter.value) {
          // facets for filtering item results
          let terms = filter.value.map(element => {
            let termObject = {}
            termObject[DOCUMENT_TYPE] = element
            return el.queryTerm(termObject).query
          })
          if (terms.length > 0) {
            let bools = el.queryBool([], terms).query
            body["post_filter"] = {
              bool : {
                should: bools.bool.should
              }
            }
          }
        }
        //facet results
        //commentend aggregation depending on query results
        let aggr1 = el.aggsTerms(QUERY_LINKS, DOCUMENT_TYPE, null, 10000, 0).aggs;
        if (body[AGGS] == null) {
          body[AGGS] = aggr1;
        } else {
          body[AGGS][QUERY_LINKS] = aggr1[QUERY_LINKS];
        }
        break
      case ENTITY_TYPES: //list of entity types for inner filter
        let aggr2 = el.globalAggsTerms(ENTITY_TYPES, DOCUMENT_TYPE, 10000, { filter: 'all_entities', term: 'parent_type', value: "entity" }).aggs;
        if (body[AGGS] == null) {
          body[AGGS] = aggr2
        } else {
          body[AGGS][ENTITY_TYPES] = aggr2[ENTITY_TYPES];
        }
        break;
      case ENTITY_LINKS:
        // add query entity list
        let list = []
        if (filter && filter.value) {
          filter.value.forEach(value => {
            let term = {}
            filter.searchIn.forEach(x => {
              term[x.key] = value;
            })
            list.push(el.queryNested(RELATED_ENTITIES, el.queryTerm(term)).query)
          })

          let bools = el.queryBool(list).query
          bools.bool.must.map(x => {
            etFilter[QUERY][BOOL][MUST].push(x)
          })

          if (body[QUERY] == null)
            body[QUERY] = bools
          else if (body[QUERY][BOOL] == null)
            body[QUERY][BOOL] = bools.bool
          else if (body[QUERY][BOOL][MUST] == null)
            body[QUERY][BOOL][MUST] = bools.bool.must
          else
            bools.bool.must.map(x => {
              body[QUERY][BOOL][MUST].push(x)
            })
        }

        const limit:number = ( filter.pagination != undefined ) ? filter.pagination.limit : 1000; 
        const offset:number = ( filter.pagination != undefined ) ? filter.pagination.offset : 0; 
        const size:number =  offset + limit;

        let aggr_filter;
        let filter_object = {};
        let must_list = [];
        if ( filters[ENTITY_TYPES] && filters[ENTITY_TYPES].value.length > 0 ){
          must_list.push({
            "terms": {
              "relatedEntities.typeOfEntity": filters[ENTITY_TYPES].value 
            }
          })    
        }              
        if ( filters[ENTITY_SEARCH] && filters[ENTITY_SEARCH].value.length != null ){
          must_list.push(
            { "query_string": {
                "query": filters[ENTITY_SEARCH].value + "*",
                "fields": [
                    "relatedEntities.label"
                ]
            }}
          )           
        }
        
        const entity_types_filter = {
          filter: {
            bool : el.queryBool().query.bool
          },
          aggs: {} 
        };

        filter_object = el.queryBool(must_list).query;
        aggr_filter = el.filterAggsTerms(ENTITY_LINKS, 'relatedEntities.id', size, filter_object, 'relatedEntities');
        aggr_filter['aggs'][ENTITY_LINKS]['aggs'][ENTITY_LINKS]['aggs'] = el.aggsTerms(ENTITY_LINKS, 'relatedEntities.typeOfEntity', null, size).aggs;
        aggr_filter['aggs'][ENTITY_LINKS]['aggs'][ENTITY_LINKS]['aggs'][ENTITY_LINKS + "_label"] = el.aggsTerms(ENTITY_LINKS + "_label", 'relatedEntities.label.keyword', null, size).aggs[ENTITY_LINKS + "_label"]
        aggr_filter['aggs'][ENTITY_LINKS]['aggs']['distinctTerms'] = {"cardinality": {"field":"relatedEntities.id"}}
        
        entity_types_filter.aggs[ENTITY_LINKS] = aggr_filter
        

        if (body[AGGS] == null) {
          body[AGGS] = entity_types_filter
        } else {
          body[AGGS][ENTITY_LINKS] = entity_types_filter;
        }
        
          
        //add aggs for selected filters
        if (filter && filter.value && filter.value.length > 0) {
          let aggrActive = el.aggsNestedTerms(ACTIVE_ENTITY_LINKS, 'relatedEntities.id', null, size, 'relatedEntities', true, filter.value);
          aggrActive['aggs'][ACTIVE_ENTITY_LINKS]['aggs'][ACTIVE_ENTITY_LINKS]['aggs'] = el.aggsTerms(ENTITY_LINKS, 'relatedEntities.typeOfEntity', null, size).aggs
          aggrActive['aggs'][ACTIVE_ENTITY_LINKS]['aggs'][ACTIVE_ENTITY_LINKS]['aggs'][ENTITY_LINKS + "_label"] = el.aggsTerms(ACTIVE_ENTITY_LINKS + "_label", 'relatedEntities.label.keyword', null, size).aggs[ACTIVE_ENTITY_LINKS + "_label"]  
          body[AGGS][ACTIVE_ENTITY_LINKS] = aggrActive;
        }
        break
        case RESOURCE_ID: 
          if (filter && filter.value && filter.value != "") {
            let searchIn = filter.searchIn[0].key
            let value = filter.value[0]
            let termObject = { [searchIn] : value};   
            let termQuery = el.queryTerm(termObject).query
            let bools = el.queryBool([termQuery]).query
            if (body[QUERY] == null)
              body[QUERY] = bools
            else if (body[QUERY][BOOL] == null)
              body[QUERY][BOOL] = bools.bool
            else if (body[QUERY][BOOL][MUST] == null)
              body[QUERY][BOOL][MUST] = bools.bool.must
            else
              bools.bool.must.map(x => {
                body[QUERY][BOOL][MUST].push(x)
              })          
          }
        break;
        case DOC_CLASSIFICATION: 
          if (filter && filter.value && filter.value != "") {
            let value = filter.value[0]
            let termObject1 = { [DOCUMENT_CLASSIFICATION] : value};   
            let termObject2 = { [DOCUMENT_TYPE] : value};   
            let termQuery1 = el.queryTerm(termObject1).query
            let termQuery2 = el.queryTerm(termObject2).query
            let shouldBoolQuery = el.queryBool(null, [termQuery1, termQuery2]).query;

            let bools = el.queryBool([{[BOOL]: shouldBoolQuery.bool}]).query
            if (body[QUERY] == null)
              body[QUERY] = bools
            else if (body[QUERY][BOOL] == null)
              body[QUERY][BOOL] = bools.bool
            else if (body[QUERY][BOOL][MUST] == null)
              body[QUERY][BOOL][MUST] = bools.bool.should
            else
              bools.bool.must.map(x => {
                body[QUERY][BOOL][MUST].push(x)
              })          
          }
          let aggr3 = el.globalAggsTerms(DOC_CLASSIFICATION, DOCUMENT_CLASSIFICATION, 10000, null).aggs;
          if (body[AGGS] == null) {
            body[AGGS] = aggr3
          } else {
            body[AGGS][DOC_CLASSIFICATION] = aggr3[DOC_CLASSIFICATION];
          }
        break;
    }
  })

  if (body['post_filter']) {
    body[AGGS][ENTITY_LINKS]['filter'] = body['post_filter'];
  }

  if( searchParameters.gallery ){
    body[QUERY][BOOL][MUST].push({
      "exists": {
        "field": "digitalObjects"
      }
    })
    body[QUERY][BOOL][MUST].push({
      "terms": {
        "digitalObjects.doType.keyword": ["pdf", "jpg-png", "iip"]
      }
    })
  }

  body['highlight'] = highlight;

  let request = el.requestBuilder(GLOBAL_INDEX, body)
  //console.log("SEARCH",JSON.stringify(request))
  let result = await el.search(request)
  return result;
}

export async function getMapObjects(field) {

  if (!field || field == "") {
    field = "fields.coordinate";
  }
  const request = el.requestBuilder(GLOBAL_INDEX, el.queryExists(field))
  request["body"]["size"] = 999;
  const body = await el.search(request).then(x => x.hits.hits);

  let elements = [];

  if (body.length > 0) {
    body.map(x => {       
        elements.push({item: x._source})
      });
  }

  return elements; 
}

export async function getEventObjects(field) {

  if (!field || field == "") {
    field = "date_start";
  }
  const termObject = {"document_type": "evento"}
  const q1 = el.queryTerm(termObject)
  const q2 = el.queryExists(field);
  
  const queryBool = el.queryBool([q1.query,q2.query]);
  const request = el.requestBuilder(GLOBAL_INDEX, queryBool)
  const body = await el.search(request).then(x => x.hits.hits);

  let elements = [];

  if (body.length > 0) {
    body.map(x => {       
        elements.push({item: x._source})
      });
  }

  return elements; 
}

export async function getResourceById(id) {

  const termObject = {"id": id}
  const q1 = el.queryTerms(termObject);
  
  const queryBool = el.queryBool([q1.query]);
  const request = el.requestBuilder(GLOBAL_INDEX, queryBool);
  request["size"] = id.length;
  const body = await el.search(request).then(x => x.hits.hits);

  let elements = [];

  if (body.length > 0) {
    body.map(x => {       
        elements.push(x._source)
      });
  }

  return elements; 
}
