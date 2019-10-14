import { search } from "./elasticsearch"
import { json } from "body-parser"

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

export async function getEntitiesCountData() {
	var query = {
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
								"script": " '{\"id\":\"' + doc['connectedEntities.id'].value + '\", \"label\":\"' + doc['connectedEntities.label'].value + '\", \"typeOfEntity\":{\"configKey\":\"' +  doc['connectedEntities.typeOfEntity.configKey'].value + '\", \"label\":\"' + doc['connectedEntities.typeOfEntity.label'].value + '\", \"id\":\"' + doc['connectedEntities.typeOfEntity.id'].value + '\"}}'",
								"size": 10000
							}
						}
					}
				}
			},
			"size": 0
		}
	}
	const body = await search(query)
	const res = body.aggregations.entities.doc_per_entities.buckets.map((x: any) => {
		x.entity = JSON.parse(x.key)
		x.count = x.doc_count
		delete x.key
		delete x.doc_count
		return x
	})
	return res;
}