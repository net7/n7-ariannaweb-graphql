import * as el from "./elasticsearch"
import { parse } from "url"

class Page {
	offset: number
	limit: number
}

const scriptEntityFields = "'{\"id\":\"' + doc['connectedEntities.id'].value + '\",\"label\":\"' + doc['connectedEntities.label'].value + '\", \"typeOfEntity\":\"' + doc['connectedEntities.typeOfEntity'].value + '\"}'"

function createFields(object: any): any {
	let array = []
	for (const prop in object) {
		if (object.hasOwnProperty(prop)) {
			if (typeof object[prop] === 'string')
				array.push({key: prop, value: object[prop]})
			else if (Array.isArray(object[prop])){
				let obj = {label: prop, fields: []}
				object[prop].forEach(el => {
					if (typeof el === 'string')
						obj.fields.push(createFields(el))
					else 
					obj.fields.push({label: null, fields: createFields(el)})
				});
				array.push(obj)
			}
		}
	}
	return array
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
	const req1 = el.requestBuilder('entities', el.queryTerm({ id: entityId }))

	//get items connected to the Entity
	const q1 = el.queryTerm({ 'connectedEntities.id': entityId })
	const quNes = el.queryNested('connectedEntities', q1)
	const script = scriptEntityFields
	const agg = el.aggsTerms("docsPerEntity", null, script, entitiesListSize)
	const agNes = el.aggsNested('entities', 'connectedEntities', agg)

	const req2 = el.requestBuilder('cultural_objects', {
		query: quNes.query,
		aggs: agNes.aggs,
		size: itemsPagination.limit,
		from: itemsPagination.offset
	})
	var entities = []
	const results = await Promise.all(
		[el.search(req1).then(x => {
			let entity = x.hits.hits.length > 0 ? x.hits.hits[0]._source : null
			if(entity != null){
				entity['fieldsTab'] = createFields(entity.fields)
			}
			return entity
		}
		), el.search(req2).then(x => {
			entities = x.aggregations.entities.docsPerEntity.buckets.map(x => {
				return {
					entity: JSON.parse(x.key),
					count: x.doc_count
				}
			})
			return x.hits.hits.map(y => { return { item: y._source } })
		})])
	if (results == null) {
		return null
	}
	results[0]['items'] = results[1]
	results[0]['entities'] = entities
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

	const request = el.requestBuilder('cultural_objects', el.queryTerm({ id: itemId }))
	const body = await el.search(request).then(x => x.hits.hits)

	if (body.length > 0) {
		const hashMap = {}
		let item = body[0]._source
		const results = await Promise.all([
			item.connectedEntities.forEach(x => hashMap[x.id] = x),
			getItemsFiltered(null, { limit: 0, offset: 0 }, 10000).then(x => x.entitiesData)
		])
		results[1] = results[1].filter(x => hashMap[x.entity.id] != null ? true : false).slice(0, entitiesListSize)
		const result = await getItemsFiltered(results[1].slice(0, 2).map(x => x.entity.id),
			{ limit: maxSimilarItems, offset: 0 }, 1, itemId).then(x => x.itemsPagination.items)
		item['connectedEntities'] = results[1]
		item['items'] = result
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
	if (typeOfEntity != null && typeOfEntity !== ""){
		const q1 = el.queryTerm({ "typeOfEntity": typeOfEntity })
		const q3 = el.queryTerm({ "connectedEntities.typeOfEntity": typeOfEntity })
		boolsArray.push(q1.query)
		boolsArray2.push(q3.query)
	}

	const q2 = el.queryString({ fields: ['label'], value: input.trim() + "*" })
	boolsArray.push(q2)
	const bools = el.queryBool(boolsArray)
	const request = el.requestBuilder('entities', {
		query: bools.query,
		size: itemsPagination.limit,
		from: itemsPagination.offset
	})
	
	const q4 = el.queryString({ fields: ['connectedEntities.label'], value: input.trim() + "*" })
	boolsArray2.push(q4)
	const bools2 = el.queryBool(boolsArray2)
	const quNes = el.queryNested('connectedEntities', bools2)
	const agg = el.aggsTerms('docsPerEntity', "connectedEntities.id")
	const agNes = el.aggsNested('entities', 'connectedEntities', agg)

	const request2 = el.requestBuilder('cultural_objects', {
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
		if(entityHashMap[el.key]){
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
export async function getItemsFiltered(entityIds: [string], itemsPagination: Page = { limit: 10000, offset: 0 }, entitiesListSize: number = 10000, itemIdToDiscard: string = null) {

	const script = scriptEntityFields
	const agg = el.aggsTerms("docsPerEntity", null, script, entitiesListSize)
	const agNes = el.aggsNested('entities', 'connectedEntities', agg)
	const source = "def list = new HashMap(); for (type in params['_source'].connectedEntities) { def key = type.typeOfEntity; if(list[key] != null){list[key]['count']++;} else { list[key] = new HashMap(); list[key]['count'] = 1; list[key]['type'] = type.typeOfEntity; }} return list;"
	const scFi = el.scriptFields('typeOfEntitiesCount', source)

	const body = {
		aggs: agNes.aggs, script_fields: scFi.script_fields,
		stored_fields: ["_source"],
		size: itemsPagination.limit,
		from: itemsPagination.offset
	}

	const entities = []
	if (entityIds != null && entityIds.length > 0) {
		for (const entityId of entityIds) {
			entities.push(el.queryNested("connectedEntities", el.queryTerm({ "connectedEntities.id": entityId })).query)
		}
		body['query'] = el.queryBool(entities).query
	}

	const request = el.requestBuilder('cultural_objects', body)

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

export function search(searchParameters: any) {

	const facets = {}
	const filters = searchParameters.filters
	searchParameters.facets.forEach(facet => {
		facets[facet.id] = facet
	})
	filters.forEach(filter => {
		if (filter.value != null || filter.facetId === "query-all"){
			const facet = facets[filter.facetId]

			let request = {}
			switch(filter.facetId) {
				case "query":
					let searchIn = filter.searchIn[0]
					let term = filter.value // searchIn.operator === "LIKE" ? filter.value + "*" ? searchIn.operator === "=" : filter.value + "*" : filter.value + "*"
					request['query'] = el.queryTerm({"${searchIn.key}": term})
					break
				case "query-all":
					searchIn = filter.searchIn[0]
					term = filter.value // searchIn.operator === "LIKE" ? filter.value + "*" ? searchIn.operator === "=" : filter.value + "*" : filter.value + "*"
					request["query"] = el.queryBool([el.queryNested("connectedEntites", 
					el.queryString({fields: ["connectedEntities.*"], value: term})).query,
					el.queryString({fields: ["*"], value: term})]).query
					break
				case "query-links":
					
					break
				case "entity-links":
					break
			}
		}
		
	})
}