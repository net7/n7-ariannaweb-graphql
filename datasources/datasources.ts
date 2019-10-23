import { search } from "./elasticsearch"

/**
 * 
 * @param index index name
 * @param body http body for a query request
 */
const queryBuilder = (index: string, body: any) => {
	const x = {
		index: index,
		body: body
	}
	return x
}

/*get the path and a generic query and return a nested query block*/
/**
 * 
 * @param path pathname to reace the nested field
 * @param query query to apply on a nested object field
 */
const queryNested = (path: string, query: any) => {
	const x = {
		query: {
			nested: {
				path: path,
				query: query.query
			}
		}
	}
	return x
}

/**
 * 
 * @param field field name
 * @param script script to generate a script field
 */
const scriptFields = (field: string, script: string) => {
	const x = {
		script_fields: {}
	}
	x.script_fields[field] = {
		script: {
			source: script
		}
	}
	return x
}

/**
 * 
 * @param buckets buckets name
 * @param path path of a nested field
 * @param aggs aggs block to apply on a nested object field
 */
const aggsNested = (buckets: string, path: string, aggs: any) => {
	const x = {
		aggs: {}
	}
	x.aggs[buckets] = {
		nested: {
			path: path,
		},
		aggs: aggs.aggs
	}
	return x
}

/**
 * 
 * @param buckets buckets name
 * @param field field to aggregate
 * @param script script to aggregate field in a custom way 
 * @param size 
 */
const aggsTerms = (buckets: string, field: string = null, script: string = null, size: number = 10000) => {
	const x = {
		aggs: {}
	}
	x.aggs[buckets] = {
		terms: {
			min_doc_count: 1,
			size: size,
		}
	}

	if (field != null)
		x.aggs[buckets].terms['field'] = field
	if (script != null)
		x.aggs[buckets].terms['script'] = script
	return x
}

/**
 * 
 * @param mustList list of query blocks to insert in multi-conditions block
 */
const queryBool = (mustList: any[]) => {
	const x = {
		query: {
			bool: {
				must: mustList
			}
		}
	}
	return x
}

/**
 * 
 * @param queryField object containing the field name and the value to search on it
 */
const queryString = (queryField: { field: string, value: string }) => {
	const x = {
		query_string: {
			query: "*" + queryField.value.trim() + "*",
			default_field: queryField.field
		}
	}
	return x
}

/**
 * 
 * @param termField object containing the field name as key and the field value to search as the value
 */
const queryTerm = (termField: any) => {
	return {
		query: {
			term: termField
		}
	}
}

/**
 * 
 * @param entityId entity Id to recall corresponding entity
 */
export async function getEntity(entityId: string) {
	if (entityId == null || entityId === '')
		return null

	const query = queryBuilder('entities', queryTerm({ id: entityId }))
	const body = await search(query)
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
	const query = queryBuilder('cultural_objects', queryTerm({ id: itemId }))
	const body = await search(query)
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
export async function getEntitiesFiltered(input: string, itemsPagination: { limit: number, offset: number } = { limit: 100000, offset: 0 }, typeOfConfigKey: string) {

	const q1 = queryTerm({ "typeOfEntity.configKey": typeOfConfigKey })
	const q2 = queryString({ field: 'label', value: input })
	const bools = queryBool([q1.query, q2])
	const query = queryBuilder('entities', {
		query: bools.query,
		size: itemsPagination.limit,
		from: itemsPagination.offset
	})

	const q3 = queryTerm({ "connectedEntities.typeOfEntity.configKey": typeOfConfigKey })
	const q4 = queryString({ field: 'connectedEntities.label', value: input })
	const bools2 = queryBool([q3.query, q4])
	const quNes = queryNested('connectedEntities', bools2)
	const agg = aggsTerms('docsPerEntity', "connectedEntities.id")
	const agNes = aggsNested('entities', 'connectedEntities', agg)

	const query2 = queryBuilder('cultural_objects', {
		query: quNes.query,
		aggs: agNes.aggs,
		size: 0
	})

	const entityHashMap = {}

	const res = await Promise.all(
		[search(query), search(query2).then(res => res.aggregations.
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

	const script = "'{\"id\":\"' + doc['connectedEntities.id'].value + '\",\"label\":\"' + doc['connectedEntities.label'].value + '\", \"typeOfEntity\":{\"configKey\":\"' + doc['connectedEntities.typeOfEntity.configKey'].value + '\", \"label\":\"' + doc['connectedEntities.typeOfEntity.label'].value + '\", \"id\":\"' + doc['connectedEntities.typeOfEntity.id'].value + '\"}}'"
	const agg = aggsTerms("docsPerEntity", null, script, entitiesListSize)
	const agNes = aggsNested('entities', 'connectedEntities', agg)
	const source = "def list = new HashMap(); for (type in params['_source'].connectedEntities) { def key = type.typeOfEntity.configKey; if(list[key] != null){list[key]['count']++;} else { list[key] = new HashMap(); list[key]['count'] = 1; list[key]['type'] = new HashMap(); list[key]['type']['configKey'] = type.typeOfEntity.configKey; list[key]['type']['id'] = type.typeOfEntity.id; list[key]['type']['label'] = type.typeOfEntity.label}} return list;"
	const scFi = scriptFields('typeOfEntitiesCount', source)

	const body = {
		aggs: agNes.aggs, script_fields: scFi.script_fields,
		stored_fields: ["_source"],
		size: itemsPagination.limit,
		from: itemsPagination.offset
	}

	const entities = []
	if (entityIds != null && entityIds.length > 0) {
		for (const entityId of entityIds) {
			entities.push(queryNested("connectedEntities", queryTerm({ "connectedEntities.id": entityId })).query)
		}
		body['query'] = queryBool(entities)
	}

	const query = queryBuilder('cultural_objects', body)

	const res = await search(query)
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

	return { itemsPagination: { items: results[0], totalCount: res.hits.count }, entitiesData: results[1] };
}