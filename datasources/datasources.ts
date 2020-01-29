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
const GLOBAL_INDEX = config['index']['globalIndex'] || "global"
const ENTITIES_INDEX = config['index']['entitiesIndex'] || "entities"
const OC_INDEX = config['index']['ocIndex'] || "cultural_objects"
const ENTITIES = "entities"
const RELATED_ENTITIES = "relatedEntities"
const RELATED_ITEMS = "relatedItems"
const TYPE_OF_ENTITY = "typeOfEntity"
const LABEL = "label"
const ID = "id"
const CHILDREN = "branches"
const LEVEL = "level"
const POSITION = "position"
const RELATION = "relation"

const scriptEntityFields = "'{\"" + ID + "\":\"' + doc['" + RELATED_ENTITIES +
	"." + ID + "'].value + '\",\"" + LABEL + "\":\"' + doc['" + RELATED_ENTITIES +
	"." + LABEL + ".keyword'].value.replace('\u0022', '') + '\", \"" + TYPE_OF_ENTITY + "\":\"' + doc['" + RELATED_ENTITIES +
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
	const agg = el.aggsTerms("docsPerEntity", null, script, entitiesListSize)
	const agNes = el.aggsNested(ENTITIES, RELATED_ENTITIES, agg)

	const req = el.requestBuilder(OC_INDEX, {
		query: quNes.query,
		aggs: agNes.aggs,
		size: itemsPagination.limit,
		from: itemsPagination.offset
	})
	var entities = []
	const items = await el.search(req).then(x => {
		entities = x.aggregations.entities.docsPerEntity.buckets.map(x => {
			return {
				entity: JSON.parse(x.key),
				count: x.doc_count
			}
		}).filter(x => x.entity.id !== entityId)

		return x.hits.hits.map(y => { return makeItemListing(y._source, entityId) })
	})
	return { relatedEntities: entities, relatedItems: items }
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
	}),
	getRelations(entityId, itemsPagination, entitiesListSize)
	])

	if (results[0] == null) {
		return null
	}

	results[0][RELATED_ITEMS] = results[1][RELATED_ITEMS]
	results[0][RELATED_ENTITIES] = results[1][RELATED_ENTITIES]
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
		const hashMap = {}
		let item = body[0]._source
		const results = await Promise.all([
			item.relatedEntities != null ? item.relatedEntities.forEach(x => hashMap[x.id] = x) : null,
			getItemsFiltered(null, { limit: 1, offset: 0 }, 10000).then(x => x.entitiesData)
		])
		results[1] = results[1].filter(x => hashMap[x.entity.id] != null).map(x => { x[RELATION] = hashMap[x.entity.id][RELATION]; return x; } ).slice(0, entitiesListSize)
		//return items related with first three related entities of the object
		const result = await getItemsFiltered(results[1].slice(0, 2).map(x => x.entity.id),
			{ limit: maxSimilarItems, offset: 0 }, 1, itemId).then(x => x.itemsPagination.items)
		item[RELATED_ENTITIES] = results[1]
		item[RELATED_ITEMS] = result
		return item
  } else {
    const request2 = el.requestBuilder(TREE_INDEX, el.queryTerm({ id: itemId }))
    const body = await el.search(request2).then(x => x.hits.hits)
    const hashMap = {}
    if (body.length > 0) {
      let item = body[0]._source
      if(!item.title) {
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


    aggr1["type"]['aggs'] = el.topHits("hits", itemsPagination.limit, itemsPagination.offset).aggs;
    /*{
      "hits": {"top_hits":  {
        "size": itemsPagination.limit,
        "from": itemsPagination.offset,
        "sort": [
          {"_score": {"order": "desc"}},
          { "label.keyword" : {"order" : "asc"}}
        ],
        "highlight" : {
          "fields" : {
              "label" : {}
          }
        }
      },

      }
      }*/

  }

  const highlight = { fields: {}};
  highlight.fields[LABEL] = {};

	const q2 = el.queryString({ fields: [LABEL], value: el.buildQueryString(input) })
	boolsArray.push(q2)
  const bools = el.queryBool(boolsArray)
const request = el.requestBuilder(GLOBAL_INDEX, {
		query: bools.query,
		size: itemsPagination.limit,
    from: itemsPagination.offset,
    aggs: aggr1,
    highlight: highlight

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
	const res = await Promise.all(
		[el.search(request).then(x => {
      total = x.hits.total
      let results = [];
      if( x.aggregations ){
        x.aggregations.type.buckets.map(bucket => {
          bucket.hits.hits.hits.forEach(element => {
            if( element.highlight ){
              element._source.highlight = element.highlight;
            }
            results.push(element._source);
          });
          }
        )
        return results;
      } else {
        return x.hits.hits.map( x => {
          x._source.highlight = x.highlight;
           return x._source ;
        })
      }
    }), el.search(request2).then(res => {res.aggregations.
        entities.docsPerEntity.buckets.forEach( el => {
          entityHashMap[el.key] = el.doc_count;
        })
      }
      )])
	const results = []
	res[0].forEach(el => {
    if(el.parent_type == "entity" ){
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
      results.push({item: el})
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

  const agg = el.aggsTerms("docsPerEntity", null, scriptEntityFields, entitiesListSize)

  let aggsEntity = el.aggsTerms("entities", 'relatedEntities.typeOfEntity');
  aggsEntity.aggs['entities']['aggs'] = agg.aggs;

  let agNes = el.aggsNested(ENTITIES, RELATED_ENTITIES, aggsEntity)
  let aggr1 = el.aggsTerms("type", "relatedEntities.typeOfEntity", null, 10000, 0).aggs;
 /* aggr1["type"]['aggs'] =  el.topHits("hits", entitiesListSize, 0).aggs;;

  let topHitsNested = {
    "nested": {
      "path": "relatedEntities"
    },
    "aggs": aggr1
  }*/



  //const source = "def list = new HashMap(); for (type in params['_source']." + RELATED_ENTITIES + ") { def key = type." + TYPE_OF_ENTITY + "; if(list[key] != null){list[key]['count']++;} else { list[key] = new HashMap(); list[key]['count'] = 1; list[key]['type'] = type." + TYPE_OF_ENTITY + "; }} return list;"
	//const scFi = el.scriptFields('typeOfEntitiesCount', source)

	const body = {
		aggs: agNes.aggs,

		//		script_fields: scFi.script_fields,
		"_source": [],
		size: itemsPagination.limit,
    from: itemsPagination.offset,
    sort: [{"label.keyword": {"order": "asc"}}]
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

	const res = await el.search(request)
  //const buckets = res.aggregations[ENTITIES].docsPerEntity.buckets
  const buckets = res.aggregations[ENTITIES][ENTITIES].buckets;
	const typesOfEntity = {};
  let entitiesList = [];

	const results = await Promise.all([
		res.hits.hits.filter(x => !(x._source.id === itemIdToDiscard)).map(x => makeItemListing(x._source)),
	/*	buckets.map(x => {
			let entity = JSON.parse(x.key)
			return {
				entity: entity,
        count: x.doc_count
			}
    })*/
    buckets.forEach(element => {
      element.docsPerEntity.buckets.map(x => {
        let entity = JSON.parse(x.key)
        entitiesList.push(
           {
            entity: entity,
            count: x.doc_count
          }
        )
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
    //typeOfEntityData: typeOfEntityData,
    entitiesData: entitiesList
  };
}

function buildTree(node: any, nodeList: any[]): any {
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
		size: 10000
	}
	query.sort[POSITION] = { "order": "asc" }
	const request = el.requestBuilder(TREE_INDEX, query)

	var res = await el.search(request, "1m")
	var scrollId = res._scroll_id
	res = res.hits.hits.map(x => x._source)
	var res2
	do {
		res2 = await el.scroll(scrollId, "1m")
	}
	while (res2.hits.hits > 0) {
		scrollId = res2._scroll_id
		res.push(res2.hits.hits)
	}
	const root = res.shift()
	const tree = buildTree(root, res)
	return tree
}

export async function getNode(id: string, maxSimilarItems: number, entitiesListSize: number) {
	const results = await Promise.all([el.search(el.requestBuilder("tree", el.queryTerm({ id: id }))),
	getItem(id, maxSimilarItems, entitiesListSize)])

	return results[1] != null ? results[1] : results[0].hits.hits.length > 0 ? results[0].hits.hits[0]._source : null
}

/**
 * Search section: constants and functions
 */

const QUERY = "query"
const QUERY_ALL = "query-all"
const QUERY_LINKS = "query-links"
const ENTITY_LINKS = "entity-links"
const ENTITY_TYPES = "entity-types"
const ENTITY_SEARCH = "entity-search"

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
const OC = "oggetto-culturale"

async function makeElement(element: any) {
	if (element[DOCUMENT_TYPE] === OC){
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

	// request for global index
  let body = {}

  // request for entity types filter
  let etFilter =  el.queryBool([],[]);

  if( searchParameters.page.limit ){
    body["size"] = searchParameters.page.limit
  }
  if( searchParameters.page.offset ){
    body["from"] = searchParameters.page.offset
  }

  if( searchParameters.results.order ){
    let key = searchParameters.results.order.key;
    if (searchParameters.results.order.type == "text") {
      key += ".keyword";
    }
    let order = {};
    order[key] = {"order": searchParameters.results.order.direction};
    body["sort"] = [order];
  }

  let highlight =  { "fields" : {} };

	facets.forEach(facet => {
		const filter = filters[facet.id]
		//let internalRequest = {}
		//if (filter && filter.value) {
			switch (facet.id) {
				case QUERY:
          // query full text
          if (filter && filter.value && filter.value != ""){
            let searchIn = filter.searchIn[0]
            let term = el.buildQueryString(filter.value[0]) // searchIn.operator === "LIKE" ? filter.value + "*" ? searchIn.operator === "=" : filter.value + "*" : filter.value + "*"

            if (filters[QUERY_ALL].value == true){
              searchIn.key = "*"
            }

            highlight.fields[searchIn.key] = {};

            let bools = el.queryBool([el.queryString({ fields: [searchIn.key], value: term })]).query
            etFilter[QUERY][BOOL][MUST]  = bools.bool.must;

            if (body[QUERY] == null)
              body[QUERY] = bools
            else if (body[QUERY][BOOL] == null)
              body[QUERY][BOOL] = bools.bool
            else
              body[QUERY][BOOL][MUST]  = bools.bool.must

            }

            break
				case QUERY_LINKS: //search for resources typology
          if (filter && filter.value){
					// facets for filtering item results
            let terms = filter.value.map(element => {
              let termObject = {}
              termObject[DOCUMENT_TYPE] = element
              return el.queryTerm(termObject).query
            })

              if (terms.length > 0) {
                let bools = el.queryBool(null, terms).query
                if (body[QUERY] == null)
                  body[QUERY] = bools
                else if (body[QUERY][BOOL] == null)
                  body[QUERY][BOOL] = bools.bool
                else
                  body[QUERY][BOOL][MUST].push(bools)
              }
          }
          //facet results
          //commentend aggregation depending on query results
          let aggr1 = el.aggsTerms(QUERY_LINKS, DOCUMENT_TYPE, null, 10000, 0).aggs;
          if (body[AGGS] == null){
            body[AGGS] = aggr1;
          }else {
            body[AGGS][QUERY_LINKS] = aggr1[QUERY_LINKS];
          }
          //global aggregation
         /* let aggr1 = el.globalAggsTerms(QUERY_LINKS, DOCUMENT_TYPE, 10000, null).aggs;
            if (body[AGGS] == null){
              body[AGGS] = aggr1
            } else {
              body[AGGS][QUERY_LINKS] = aggr1[QUERY_LINKS];
            }*/
					break
				case ENTITY_TYPES: //list of entity types for inner filter
            let aggr2 = el.globalAggsTerms(ENTITY_TYPES, DOCUMENT_TYPE, 10000, {filter: 'all_entities', term:'parent_type', value: "entity"}).aggs;
            if (body[AGGS] == null){
              body[AGGS] = aggr2
            } else {
              body[AGGS][ENTITY_TYPES] = aggr2[ENTITY_TYPES];
            }
					break;
				case ENTITY_LINKS:
					// add query entity list
          let list = []
          if (filter && filter.value){
            filter.value.forEach(value => {
              let term = {}
              filter.searchIn.forEach( x => {
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

            //let aggr3 = el.filterAggsTerms(ENTITY_LINKS, 'label.keyword', 10000, {filter: 'all_entities', term:'parent_type', value: "entity"}).aggs;
            let aggr3 = el.aggsNestedTerms(ENTITY_LINKS, 'relatedEntities.id', null, 10000, 'relatedEntities');
            aggr3['aggs'][ENTITY_LINKS]['aggs'] = el.aggsTerms(ENTITY_LINKS, 'relatedEntities.typeOfEntity', null, 10000).aggs
            aggr3['aggs'][ENTITY_LINKS]['aggs'][ENTITY_LINKS + "_label"] = el.aggsTerms(ENTITY_LINKS + "_label", 'relatedEntities.label.keyword', null, 10000).aggs[ENTITY_LINKS + "_label"]

            if (body[AGGS] == null){
              body[AGGS] = aggr3
            } else {
              body[AGGS][ENTITY_LINKS] = aggr3;
            }
          break
			}
  })

  if (body[AGGS][QUERY_LINKS]){
    const facet = {};

    facet[QUERY_LINKS] = body[AGGS][QUERY_LINKS];

    let aggs = {
      "global":{},
      "aggs": {
      "filtered": {
        "filter": etFilter[QUERY],
        "aggs": facet
      }
    }};
    body[AGGS][QUERY_LINKS] = aggs;
  }

	// returns facets on document Type
	//body[AGGS] = el.aggsTerms(AGG_FIELD, DOCUMENT_TYPE, null, 10000).aggs

  body['highlight'] = highlight;

	let request = el.requestBuilder(GLOBAL_INDEX, body)
	//console.log(JSON.stringify(body))
	let result =  await el.search(request)
	//let elements = result.hits.hits
  //elements = await Promise.all([elements.map(x => makeElement(x._source))])

  let aggregations = [];
  let elements = [];
  const items = result.hits.hits.map(x => {
    x._source.highlight = x.highlight;
    elements.push(x._source)
  });

  if(result.aggregations){

    facets.forEach( (facet) => {
      if( result.aggregations[facet.id] != null && !facet.data ) {
        switch (facet.id) {
          case QUERY_LINKS:
            let data = result.aggregations[facet.id]["filtered"][facet.id].buckets.map(bucket => {
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
              let data3 = result.aggregations[facet.id][facet.id]['buckets'].map(bucket => {
                return {
                  "value": bucket.key,
                  "label": bucket[facet.id + "_label"].buckets[0].key,
                  "counter": bucket.doc_count,
                  "searchData": facet.searchData.map( y => {
                    return {
                      key: y,
                      value: bucket[facet.id]['buckets'].map( x => x.key )
                    }
                  })
                };
              });
              facet.data = data3;
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

/*search({
	"facets": [
		{
			"id": "query",
			"type": "value"
		},
		{
			"id": "query-all",
			"type": "value",
			"data": [
				{
					"value": "1",
					"label": "Cerca in tutti campi delle schede"
				}
			]
		},
		{
			"id": "query-links",
			"type": "value",
			"data": [
				{
					"value": "people",
					"label": "Persone",
					"counter": 80,
					"options": {
						"icon": "n7-icon-biography",
						"classes": "color-people"
					}
				},
				{
					"value": "places",
					"label": "Luoghi",
					"counter": 90,
					"options": {
						"icon": "n7-icon-map1",
						"classes": "color-places"
					}
				},
				{
					"value": "concepts",
					"label": "Concetti",
					"counter": 62,
					"options": {
						"icon": "n7-icon-lightbulb",
						"classes": "color-concepts"
					}
				},
				{
					"value": "organizations",
					"label": "Organizzazioni",
					"counter": 75,
					"options": {
						"icon": "n7-icon-building",
						"classes": "color-organizations"
					}
				}
			]
		},
		{
			"id": "entity-types",
			"type": "value",
			"operator": "OR",
			"limit": 10,
			"order": "count",
			"data": [
				{
					"value": "people",
					"label": "Persone"
				},
				{
					"value": "places",
					"label": "Luoghi"
				},
				{
					"value": "concepts",
					"label": "Concetti"
				},
				{
					"value": "organizations",
					"label": "Organizzazioni"
				}
			]
		},
		{
			"id": "entity-search",
			"type": "value"
		},
		{
			"id": "entity-links",
			"type": "value",
			"metadata": [
				"title",
				"entity-type"
			],
			"data": [
				{
					"value": "milano",
					"label": "milano",
					"counter": 69,
					"metadata": {
						"title": "milano",
						"entity-type": "places"
					}
				},
				{
					"value": "roma",
					"label": "roma",
					"counter": 80,
					"metadata": {
						"title": "roma",
						"entity-type": "places"
					}
				},
				{
					"value": "spazio",
					"label": "spazio",
					"counter": 71,
					"metadata": {
						"title": "spazio",
						"entity-type": "concepts"
					}
				},
				{
					"value": "rodolfo-marna",
					"label": "rodolfo marna",
					"counter": 22,
					"metadata": {
						"title": "rodolfo marna",
						"entity-type": "people"
					}
				},
				{
					"value": "alighiero-boetti",
					"label": "alighiero boetti",
					"counter": 94,
					"metadata": {
						"title": "alighiero boetti",
						"entity-type": "people"
					}
				}
			]
		},
		{
			"id": "date-from",
			"type": "value",
			"data": [
				{
					"value": "1990",
					"label": "1990"
				},
				{
					"value": "1991",
					"label": "1991"
				},
				{
					"value": "1992",
					"label": "1992"
				},
				{
					"value": "1993",
					"label": "1993"
				}
			]
		},
		{
			"id": "date-to",
			"type": "value",
			"data": [
				{
					"value": "2000",
					"label": "2000"
				},
				{
					"value": "2001",
					"label": "2001"
				},
				{
					"value": "2002",
					"label": "2002"
				},
				{
					"value": "2003",
					"label": "2003"
				}
			]
		}
	],
	"page": {
		"offset": 0,
		"limit": 10
	},
	"results": {
		"order": {
			"type": "score",
			"key": "author",
			"direction": "DESC"
		},
		"fields": {
			"title": {
				"highlight": true,
				"limit": 50
			}
		},
		"items": []
	},
	"filters": [
		{
			"facetId": "query",
			"value": "sil",
			"searchIn": [
				{
					"key": "label",
					"operator": "LIKE"
				}
			]
		},
		{
			"facetId": "query-all",
			"value": null,
			"searchIn": [
				{
					"key": "query-all",
					"operator": "="
				}
			]
		},
		{
			"facetId": "query-links",
			"value": [
				"organizzazioni",
				"persona"
			],
			"searchIn": [
				{
					"key": "relatedEntities.typeOfEntity",
					"operator": "="
				}
			]
		},
		{
			"facetId": "entity-links",
			"value": ["0263a407-d0dd-4647-98e2-109b0b0c05f3"],
			"searchIn": [
				{
					"key": "source.id",
					"operator": "="
				}
			]
		},
		{
			"facetId": "date-from",
			"value": null,
			"searchIn": [
				{
					"key": "source.dateStart",
					"operator": ">="
				}
			]
		},
		{
			"facetId": "date-to",
			"value": null,
			"searchIn": [
				{
					"key": "source.dateEnd",
					"operator": "<="
				}
			]
		}
	],
	"totalCount": 557
})*/