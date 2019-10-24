import * as el from "./elasticsearch"

/**
 * 
 * @param entityId entity Id to recall corresponding entity
 */
export async function getEntity(entityId: string) {
	if (entityId == null || entityId === '')
		return null

	const request = el.requestBuilder('entities', el.queryTerm({ id: entityId }))
	const body = await el.search(request)
	const res = body.hits.hits
	if (res.length > 0)
		return res[0]._source;
	else
		return null;
}

/**
 * 
 * @param itemId item Id to recall corresponding item
 */
export async function getItem(itemId: string) {
	const request = el.requestBuilder('cultural_objects', el.queryTerm({ id: itemId }))
	const body = await el.search(request)
	const res = body.hits.hits
	if (res.length > 0)
		return res[0]._source;
	else
		return null;
}

/**
 * 
 * @param input string to search in a label field of an entity
 * @param itemsPagination object containing pagination parameter
 * @param typeOfConfigKey category where to searh entities with names similar to input
 */
export async function getEntitiesFiltered(input: string, itemsPagination: { limit: number, offset: number } = { limit: 100000, offset: 0 }, typeOfEntity: string) {

	const q1 = el.queryTerm({ "typeOfEntity": typeOfEntity })
	const q2 = el.queryString({ field: 'label', value: input })
	const bools = el.queryBool([q1.query, q2])
	const request = el.requestBuilder('entities', {
		query: bools.query,
		size: itemsPagination.limit,
		from: itemsPagination.offset
	})

	const q3 = el.queryTerm({ "connectedEntities.typeOfEntity": typeOfEntity })
	const q4 = el.queryString({ field: 'connectedEntities.label', value: input })
	const bools2 = el.queryBool([q3.query, q4])
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
		[el.search(request), el.search(request2).then(res => res.aggregations.
			entities.docsPerEntity.buckets.forEach(x => {
				entityHashMap[x.key] = x.doc_count
			}))])
	const total = res[0].hits.total
	const results = res[0].hits.hits.map(x => {
		return {
			entity: x._source,
			count: entityHashMap[x._source.id]
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
export async function getItemsFiltered(entityIds: [string], itemsPagination: { limit: number, offset: number } = { limit: 100000, offset: 0 }, entitiesListSize: number = 10000) {

	const script = "'{\"id\":\"' + doc['connectedEntities.id'].value + '\",\"label\":\"' + doc['connectedEntities.label'].value + '\", \"typeOfEntity\":\"' + doc['connectedEntities.typeOfEntity'].value + '\"}'"
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

	const results = await Promise.all([
		res.hits.hits.map(x => {
			var list = []
			const object = x.fields.typeOfEntitiesCount[0]
			for (const prop in object) {
				if (object.hasOwnProperty(prop)) {
					list.push(object[prop])
				}
			}
			const res = {
				item: x._source,
				relatedTOEData: list
			}
			return res
		}),
		buckets.map(x => {
			return {
				entity: JSON.parse(x.key),
				count: x.doc_count
			}
		}),
	])

	return { itemsPagination: { items: results[0], totalCount: res.hits.total }, entitiesData: results[1] };
}