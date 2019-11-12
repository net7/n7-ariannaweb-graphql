import * as el from "./elasticsearch"

class Page {
	offset: number
	limit: number
}
const TREE_INDEX = "tree"
const ENTITIES_INDEX = "entities"
const OC_INDEX = "cultural_objects"
const ENTITIES = "entities"
const RELATED_ENTITIES = "relatedEntities"
const RELATED_ITEMS = "relatedItems"
const FIELDS = "fields"
const TYPE_OF_ENTITY = "typeOfEntity"
const LABEL = "label"
const ID = "id"
const CHILDREN = "branches"
const LEVEL = "level"
const POSITION = "position"

const scriptEntityFields = "'{\"" + ID + "\":\"' + doc['" + RELATED_ENTITIES +
	"." + ID + "'].value + '\",\"" + LABEL + "\":\"' + doc['" + RELATED_ENTITIES +
	"." + LABEL + ".keyword'].value.replace('\u0022', '') + '\", \"" + TYPE_OF_ENTITY + "\":\"' + doc['" + RELATED_ENTITIES +
	"." + TYPE_OF_ENTITY + "'].value + '\"}'"


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
	var termObject = {}
	termObject[ID] = entityId
	const req1 = el.requestBuilder(ENTITIES_INDEX, el.queryTerm(termObject))

	//get items connected to the Entity
	termObject = {}
	termObject[RELATED_ENTITIES + "." + ID] = entityId
	const q1 = el.queryTerm(termObject)
	const quNes = el.queryNested(RELATED_ENTITIES, q1)
	const script = scriptEntityFields
	const agg = el.aggsTerms("docsPerEntity", null, script, entitiesListSize)
	const agNes = el.aggsNested(ENTITIES, RELATED_ENTITIES, agg)

	const req2 = el.requestBuilder(OC_INDEX, {
		query: quNes.query,
		aggs: agNes.aggs,
		size: itemsPagination.limit,
		from: itemsPagination.offset
	})
	var entities = []
	const results = await Promise.all(
		[el.search(req1).then(x => {
			let entity = x.hits.hits.length > 0 ? x.hits.hits[0]._source : null
			return entity
		}
		), el.search(req2).then(x => {
			entities = x.aggregations.entities.docsPerEntity.buckets.map(x => {
				return {
					entity: JSON.parse(x.key),
					count: x.doc_count
				}
			}).filter(x => x.entity.id !== entityId)
			return x.hits.hits.map(y => { return { item: y._source } })
		})])
	if (results[0] == null) {
		return null
	}
	results[0][RELATED_ITEMS] = results[1]
	results[0][RELATED_ENTITIES] = entities
	return results[0]
}

/**
 * 
 * @param itemId item Id to recall corresponding item
 * @param maxSimilarItems object containing items pagination parameter
 * @param entitiesListSize entityList size to return 
 */
export async function getItem(itemId: string, maxSimilarItems: 10000, entitiesListSize: number = 10000) {
	if (itemId == null || itemId === '')
		return null

	const request = el.requestBuilder(OC_INDEX, el.queryTerm({ id: itemId }))
	const body = await el.search(request).then(x => x.hits.hits)

	if (body.length > 0) {
		const hashMap = {}
		let item = body[0]._source
		const results = await Promise.all([
			item.relatedEntities.forEach(x => hashMap[x.id] = x),
			getItemsFiltered(null, { limit: 1, offset: 0 }, 10000).then(x => x.entitiesData)
		])
		results[1] = results[1].filter(x => hashMap[x.entity.id] != null ? true : false).slice(0, entitiesListSize)
		const result = await getItemsFiltered(results[1].slice(0, 2).map(x => x.entity.id),
			{ limit: maxSimilarItems, offset: 0 }, 1, itemId).then(x => x.itemsPagination.items)
		item[RELATED_ENTITIES] = results[1]
		item[RELATED_ITEMS] = result
		return item
	}
	return null;
}

/**
 * 
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
	const request = el.requestBuilder(ENTITIES_INDEX, {
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

	const res = await Promise.all(
		[el.search(request).then(x => {
			x.hits.hits.forEach(x => {
				entityHashMap[x._source.id] = x._source
			});
			return x.hits.total
		}), el.search(request2).then(res => res.aggregations.
			entities.docsPerEntity.buckets)])
	const total = res[0]
	const results = []
	res[1].forEach(el => {
		if (entityHashMap[el.key]) {
			results.push({
				entity: entityHashMap[el.key],
				count: el.doc_count
			})
		}
	});

	return { totalCount: total, entities: results }
}

/**
 * 
 * @param entityIds entities to filter the items connected to them
 * @param itemsPagination object containing pagination parameter
 * @param entitiesListSize entityList size to return 
 */
export async function getItemsFiltered(entityIds: [string], itemsPagination: Page = { limit: 10, offset: 0 }, entitiesListSize: number = 10000, itemIdToDiscard: string = null) {

	const agg = el.aggsTerms("docsPerEntity", null, scriptEntityFields, entitiesListSize)
	const agNes = el.aggsNested('entities', RELATED_ENTITIES, agg)
	const source = "def list = new HashMap(); for (type in params['_source']." + RELATED_ENTITIES + ") { def key = type." + TYPE_OF_ENTITY + "; if(list[key] != null){list[key]['count']++;} else { list[key] = new HashMap(); list[key]['count'] = 1; list[key]['type'] = type." + TYPE_OF_ENTITY + "; }} return list;"
	const scFi = el.scriptFields('typeOfEntitiesCount', source)

	const body = {
		aggs: agNes.aggs, script_fields: scFi.script_fields,
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
		body['query'] = el.queryBool(entities).query
	}

	const request = el.requestBuilder(OC_INDEX, body)

	const res = await el.search(request)
	const buckets = res.aggregations.entities.docsPerEntity.buckets
	const typesOfEntity = {}

	const results = await Promise.all([
		res.hits.hits.filter(x => x._source.id === itemIdToDiscard ? false : true).map(x => {
			var list = []
			const object = x.fields.typeOfEntitiesCount[0]
			for (const prop in object) {
				if (object.hasOwnProperty(prop)) {
					list.push(object[prop])
				}
			}
			const res = {
				item: x._source,
				relatedTypesOfEntity: list
			}
			return res
		}),
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
	query.sort[POSITION] = {"order": "asc"}
	const request = el.requestBuilder(TREE_INDEX, query)

	const res = await el.search(request).then(x => x.hits.hits.map(x => x._source))
	const root = res.shift()
	const tree = buildTree(root, res)
	return tree
}

export function search(searchParameters: any) {

	const facets = {}
	const filters = searchParameters.filters
	searchParameters.facets.forEach(facet => {
		facets[facet.id] = facet
	})
	filters.forEach(filter => {
		if (filter.value != null || filter.facetId === "query-all") {
			const facet = facets[filter.facetId]

			let request = {}
			switch (filter.facetId) {
				case "query":
					let searchIn = filter.searchIn[0]
					let term = filter.value // searchIn.operator === "LIKE" ? filter.value + "*" ? searchIn.operator === "=" : filter.value + "*" : filter.value + "*"
					request['query'] = el.queryTerm({ "${searchIn.key}": term })
					break
				case "query-all":
					searchIn = filter.searchIn[0]
					term = filter.value // searchIn.operator === "LIKE" ? filter.value + "*" ? searchIn.operator === "=" : filter.value + "*" : filter.value + "*"
					request["query"] = el.queryBool([el.queryNested(RELATED_ENTITIES,
						el.queryString({ fields: ["relatedEntities.*"], value: term })).query,
					el.queryString({ fields: ["*"], value: term })]).query
					break
				case "query-links":

					break
				case "entity-links":
					break
			}
		}

	})
}
