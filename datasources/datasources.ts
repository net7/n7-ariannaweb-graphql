import * as el from "./elasticsearch"
import { response } from "express"
import { mapValues } from "apollo-env"

class Page {
	offset: number
	limit: number
}
const TREE_INDEX = "tree"
const GLOBAL_INDEX = "global"
const ENTITIES_INDEX = "entities"
const OC_INDEX = "cultural_objects"
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
			if (!object[entity[TYPE_OF_ENTITY]]) { }
			object[entity[TYPE_OF_ENTITY]] = {
				count: 0,
				type: entity[TYPE_OF_ENTITY]
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
	if (typeOfEntity != null && typeOfEntity !== "") {
		var termObject = {}
		termObject[TYPE_OF_ENTITY] = typeOfEntity
		const q1 = el.queryTerm(termObject)
		termObject = {}
		termObject[RELATED_ENTITIES + "." + TYPE_OF_ENTITY] = typeOfEntity
		const q3 = el.queryTerm(termObject)
		boolsArray.push(q1.query)
		boolsArray2.push(q3.query)
	}

	const q2 = el.queryString({ fields: [LABEL], value: input.trim() + "*" })
	boolsArray.push(q2)
	const bools = el.queryBool(boolsArray)
	const request = el.requestBuilder(GLOBAL_INDEX, {
		query: bools.query,
		size: itemsPagination.limit,
		from: itemsPagination.offset
	})

	const q4 = el.queryString({ fields: [RELATED_ENTITIES + "." + LABEL], value: input.trim() + "*" })
	boolsArray2.push(q4)
	const bools2 = el.queryBool(boolsArray2)
	const quNes = el.queryNested(RELATED_ENTITIES, bools2)
	const agg = el.aggsTerms('docsPerEntity', RELATED_ENTITIES + "." + ID)
	const agNes = el.aggsNested(ENTITIES, RELATED_ENTITIES, agg)

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
      return x.hits.hits.map( x => x._source )
    }), el.search(request2).then(res => {res.aggregations.
        entities.docsPerEntity.buckets.forEach( el => {
          entityHashMap[el.key] = el.doc_count;
        })
      }
      )])
	const results = []
	res[0].forEach(el => {
		if (entityHashMap[el.id]) {
			results.push({
				entity: el,
				count: entityHashMap[el.id]
			})
		} else {
      results.push(el)
    }
	});

	return { totalCount: total, results: results }
}

/**
 *
 * @param entityIds entities to filter the items connected to them
 * @param itemsPagination object containing pagination parameter
 * @param entitiesListSize entityList size to return
 */
export async function getItemsFiltered(entityIds: [string], itemsPagination: Page = { limit: 10, offset: 0 }, entitiesListSize: number = 10000, itemIdToDiscard: string = null) {

	const agg = el.aggsTerms("docsPerEntity", null, scriptEntityFields, entitiesListSize)
	const agNes = el.aggsNested(ENTITIES, RELATED_ENTITIES, agg)
	//const source = "def list = new HashMap(); for (type in params['_source']." + RELATED_ENTITIES + ") { def key = type." + TYPE_OF_ENTITY + "; if(list[key] != null){list[key]['count']++;} else { list[key] = new HashMap(); list[key]['count'] = 1; list[key]['type'] = type." + TYPE_OF_ENTITY + "; }} return list;"
	//const scFi = el.scriptFields('typeOfEntitiesCount', source)

	const body = {
		aggs: agNes.aggs,
		//		script_fields: scFi.script_fields,
		"_source": [],
		size: itemsPagination.limit,
		from: itemsPagination.offset
	}

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
	const buckets = res.aggregations[ENTITIES].docsPerEntity.buckets
	const typesOfEntity = {}

	const results = await Promise.all([
		res.hits.hits.filter(x => !(x._source.id === itemIdToDiscard)).map(x => makeItemListing(x._source)),
		buckets.map(x => {
			let entity = JSON.parse(x.key)
			if (typesOfEntity[entity.typeOfEntity] == null)
				typesOfEntity[entity.typeOfEntity] = { type: entity.typeOfEntity, count: 0 }
			typesOfEntity[entity.typeOfEntity].count++
			return {
				entity: entity,
        count: x.doc_count
			}
		}),
	])

	var typeOfEntityData = []
	for (const prop in typesOfEntity) {
		if (typesOfEntity.hasOwnProperty(prop)) {
			typeOfEntityData.push(typesOfEntity[prop])
		}
	}

	return { itemsPagination: { items: results[0], totalCount: res.hits.total }, typeOfEntityData: typeOfEntityData, entitiesData: results[1] };
}

function buildTree(node: any, nodeList: any[]): any {
	node[CHILDREN] = []
	while (nodeList.length > 0 && nodeList[0][LEVEL] > node[LEVEL]) {
		node[CHILDREN].push(buildTree(nodeList.shift(), nodeList))
	}
	return node
}

export async function getTree() {
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
	facets.forEach(facet => {
		const filter = filters[facet.id]
		//let internalRequest = {}
		if (filter && filter.value) {
			switch (filter.facetId) {
				case QUERY:
					// query full text
					let searchIn = filter.searchIn[0]
					let term = filter.value + "*" // searchIn.operator === "LIKE" ? filter.value + "*" ? searchIn.operator === "=" : filter.value + "*" : filter.value + "*"
					if (filters[QUERY_ALL].value == true)
						searchIn.key = "*"
					let bools = el.queryBool([el.queryString({ fields: [searchIn.key], value: term })]).query
					if (body[QUERY] == null)
						body[QUERY] = bools
					else if (body[QUERY][BOOL] == null)
						body[QUERY][BOOL] = bools.bool
					else
						body[QUERY][BOOL][MUST] = bools.bool.must
					break
				case QUERY_LINKS:
					// facets for filtering item results
					let terms = filter.value.map(element => {
						let termObject = {}
						termObject[DOCUMENT_TYPE + '.' + KEYWORD] = element
						return el.queryTerm(termObject).query
					})

					if (terms.length > 0) {
						bools = el.queryBool([], terms).query
					}

					if (body[QUERY] == null)
						body[QUERY] = bools
					else if (body[QUERY][BOOL] == null)
						body[QUERY][BOOL] = bools.bool
					else
						body[QUERY][BOOL][FILTER] = bools.bool.filter
					break
				case ENTITY_TYPES:
					// TODO: da chiarire con Edgar: forse fare aggregazione per restituire i tipi di entità
					break
				case ENTITY_LINKS:
					// add query entity list
					let list = []
					filter.value.forEach(value => {
							let term = {}
							term[RELATED_ENTITIES + "." + ID] = value
							list.push(el.queryNested(RELATED_ENTITIES, el.queryTerm(term)).query)
						}
					)
					bools = el.queryBool(list).query
					if (body[QUERY] == null)
						body[QUERY] = bools
					else if (body[QUERY][BOOL] == null)
						body[QUERY][BOOL] = bools.bool
					else if (body[QUERY][BOOL][MUST] == null)
						body[QUERY][BOOL][MUST] = bools.bool.must
					else
						bools.bool.must.map(x => body[QUERY][BOOL][MUST].push(x))
					break
			}
		}
	})

	// returns facets on document Type
	body[AGGS] = el.aggsTerms(AGG_FIELD, DOCUMENT_TYPE, null, 10000).aggs

	let request = el.requestBuilder(GLOBAL_INDEX, body)
	//console.log(JSON.stringify(body))
	let result = await el.search(request)
	let elements = result.hits.hits
  elements = await Promise.all([elements.map(x => makeElement(x._source))])

  let aggregations = result.aggregations;
  let response = {
    totalCount: result.hits.total,
    filters: searchParameters.filters,
    facets: searchParameters.facets,
    results: searchParameters.results
  }

  return response;

}

search({
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
})