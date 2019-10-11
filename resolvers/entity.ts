import {search} from "./elasticsearch"

export const resolvers = {
	Entity: {
	}
}

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
	const res = await search(query)
	return res.result[0];
}