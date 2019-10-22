import { search } from "./elasticsearch"

export async function getEntity(entityId: string) {
	if (entityId == null || entityId === '')
		return null
	var query = {
		index: 'entities',
		body: {
			query: {
				match: {
					id: entityId
				}
			}
		}
	}
	const body = await search(query)
	const res = body['hit']['hit'].map(x => x['_source'])
	return res;
}

export async function getEntitiesFiltered(input: string, itemsPagination: any = null, typeOfConfigKey: string) {
	const query = {
		index: 'entities',
		body: {
			"query": {
				"bool": {
					"must": [
						{
							"term": {
								"typeOfEntity.configKey": typeOfConfigKey
							}
						},
						{
							"query_string": {
								"query": "*" + input.trim() + "*",
								"default_field": "label"
							}
						}
					]
				}
			}
		}
	}

	const query2 = {
		index: 'cultural_objects',
		body: {
			"query": {
				"nested": {
					"path": "connectedEntities",
					"query": {
						"bool": {
							"must": [
								{
									"term": {
										"connectedEntities.typeOfEntity.configKey": typeOfConfigKey
									}
								},
								{
									"query_string": {
										"query": "*" + input.trim() + "*",
										"default_field": "connectedEntities.label"
									}
								}
							]
						}
					}
				}
			},
			"aggs": {
				"entities": {
					"nested": {
						"path": "connectedEntities"
					},
					"aggs": {
						"docsPerEntity": {
							"terms": {
								"min_doc_count": 1,
								"field": "connectedEntities.id",
								"size": 10000
							}
						}
					}
				}
			},
			"size": 0
		}
	}

	if (itemsPagination) {
		query.body['size'] = itemsPagination.limit
		query.body['from'] = itemsPagination.offset
	}

	const entityHashMap = {}

	const body = await Promise.all(
		[search(query), search(query2).then(res => res.aggregations.
			entities.docsPerEntity.buckets.forEach(x => {
				entityHashMap[x.key] = x.doc_count
			}))])
	const total = body[0].hits.total
	const results = body[0].hits.hits.map(x => {
		return {
			entity: x._source,
			count: entityHashMap[x._source.id]
		}
	});
	return { totalCount: total, entities: results }
}

export async function getItemsFiltered(entityIds: [string] = null, itemsPagination: any = null, entitiesListSize: number = null) {
	const query = {
		index: 'cultural_objects',
		body: {
			"aggs": {
				"entities": {
					"nested": {
						"path": "connectedEntities"
					},
					"aggs": {
						"docsPerEntity": {
							"terms": {
								"min_doc_count": 1,
								"script": "'{\"id\":\"' + doc['connectedEntities.id'].value + '\",\"label\":\"' + doc['connectedEntities.label'].value + '\", \"typeOfEntity\":{\"configKey\":\"' + doc['connectedEntities.typeOfEntity.configKey'].value + '\", \"label\":\"' + doc['connectedEntities.typeOfEntity.label'].value + '\", \"id\":\"' + doc['connectedEntities.typeOfEntity.id'].value + '\"}}'",
								"size": 10000
							}
						}
					}
				}
			},
			"script_fields": {
				"typeOfEntitiesCount": {
					"script": {
						"source": "def list = new HashMap(); for (type in params['_source'].connectedEntities) { def key = type.typeOfEntity.configKey; if(list[key] != null){list[key]['count']++;} else { list[key] = new HashMap(); list[key]['count'] = 1; list[key]['type'] = new HashMap(); list[key]['type']['configKey'] = type.typeOfEntity.configKey; list[key]['type']['id'] = type.typeOfEntity.id; list[key]['type']['label'] = type.typeOfEntity.label}} return list;"
					}
				}
			},
			"stored_fields": [
				"_source"
			]
		}
	}

	const matchQuery = {
		"bool": {
			"must": []
		}
	}

	if (entityIds != null && entityIds.length > 0) {
		for (const entityId of entityIds) {
			const filter = {
				"nested": {
					"path": "connectedEntities",
					"query": {
						"term": {
							"connectedEntities.id": entityId
						}
					}
				}
			}
			matchQuery.bool.must.push(filter)
		}
	}

	if (itemsPagination) {
		query.body['size'] = itemsPagination.limit
		query.body['from'] = itemsPagination.offset
	}

	if (entitiesListSize) {
		query.body.aggs.entities.aggs.docsPerEntity.terms.size = entitiesListSize
	}

	if (matchQuery.bool.must.length > 0) {
		query.body['query'] = matchQuery
	}

	const body = await search(query)
	const buckets = body.aggregations.entities.docsPerEntity.buckets

	const results = await Promise.all([
		body.hits.hits.map(x => {
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

	return { itemsPagination: { items: results[0], totalCount: body.hits.count }, entitiesData: results[1] };
}