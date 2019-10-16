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

export async function getItemsFiltered(typeOfEntityList: any = null, entityIds: [string] = null, itemsPagination: any = null) {
	const query = {
		index: 'cultural_objects',
		body: {
			"aggs": {
				"entities": {
					"nested": {
						"path": "connectedEntities"
					},
					"aggs": {
						"doc_per_entities": {
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

	if (typeOfEntityList != null && typeOfEntityList.length > 0) {
		for (const type of typeOfEntityList) {
			if (type.enabled) {
				const filter = {
					"nested": {
						"path": "connectedEntities",
						"query": {
							"term": {
								"connectedEntities.typeOfEntity.id": type.typeOfEntityId
							}
						}
					}
				}
				matchQuery.bool.must.push(filter)
			}
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

	if (matchQuery.bool.must.length > 0) {
		query.body['query'] = matchQuery
	}

	const body = await search(query)
	const buckets = body.aggregations.entities.doc_per_entities.buckets
	const tOEDict = {}
	
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
	buckets.forEach(x => {
		const obj = {
		entity: JSON.parse(x.key),
		count: x.doc_count
		}
		const tOEId = obj.entity.typeOfEntity.id
		if (tOEDict[tOEId]){
			tOEDict[tOEId].countData.count += obj.count
			tOEDict[tOEId].entitiesCountData.push(obj)
		} else {
			tOEDict[tOEId] = {
				countData: {
					count: obj.count,
					type: obj.entity.typeOfEntity
				},
				entitiesCountData: [obj]
			}
		}
	}),
])

const entitiesData = []

for (const prop in tOEDict) {
	if (tOEDict.hasOwnProperty(prop)) {
		entitiesData.push(tOEDict[prop])
	}
}

	return { itemsPagination: { items: results[0], totalCount: body.hits.count }, entitiesData: entitiesData };
}