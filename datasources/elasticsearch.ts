import { Client } from '@elastic/elasticsearch'
import { elasticAuth as auth, elasticNodeAddress as addr } from "./elasticConfig"

const client = new Client({ node: addr, auth: auth, ssl: { rejectUnauthorized: false } })

/**
 * 
 * @param request http body request for elasticsearch query
 */
export async function search(request: {index: string, body: any}) {
	const { body: res } = await client.search(request)
	return res;
}

/**
 * 
 * @param index index name
 * @param body http body for a query request
 */
export const requestBuilder = (index: string, body: any) => {
	const x = {
		index: index,
		body: body
	}
	return x
}

/*get the path and a generic query and return a nested query block*/
/**
 * 
 * @param path path to reace the nested field
 * @param query query to apply on a nested object field
 */
export const queryNested = (path: string, query: any) => {
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
export const scriptFields = (field: string, script: string) => {
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
export const aggsNested = (buckets: string, path: string, aggs: any) => {
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
 * @param size max number of buckets returned
 */
export const aggsTerms = (buckets: string, field: string = null, script: string = null, size: number = 10000) => {
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
export const queryBool = (mustList = [], shouldList = [], filterList = [], notList = []) => {
	const x = {
		query: {
			bool: {
				must: mustList,
				should: shouldList,
				filter: filterList,
				must_not: notList
			}
		}
	}
	return x
}

/**
 * 
 * @param queryField object containing the field name and the value to search on it
 */
export const queryString = (queryField: { fields: string[], value: string }) => {
	const x = {
		query_string: {
			query: queryField.value,
			fields: queryField.fields
		}
	}
	return x
}

/**
 * 
 * @param termField object containing the field name as key and the field value to search as the value
 */
export const queryTerm = (termField: any) => {
	return {
		query: {
			term: termField
		}
	}
}