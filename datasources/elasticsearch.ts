import { Client } from '@elastic/elasticsearch'
import { elasticAuth as auth, elasticNodeAddress as addr } from "./elasticConfig"

const client = new Client({ node: addr, auth: auth, ssl: { rejectUnauthorized: false } })

/**
 *
 * @param request http body request for elasticsearch query
 */
export async function search(request: {index: string, body: any}, scrollKeepAlive: string = null) {
	if (scrollKeepAlive)
		request['scroll'] = scrollKeepAlive
	const { body: res } = await client.search(request)
	return res;
}

/**
 *
 * @param scrollId id to recall next window
 */
export async function scroll(scrollId: string, scrollKeepAlive: string){
	const {body: res} = await client.scroll({scroll_id: scrollId, "scroll": scrollKeepAlive})
	return res
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
 * @param buckets buckets name
 * @param field field to aggregate
 * @param size max number of buckets returned
 * @param filter object with filter field {term, value, filter}
 */
export const globalAggsTerms = function (buckets, field, size, filter) {
  if (field === void 0) { field = null; }
  if (filter === void 0) { filter = null; }
  if (size === void 0) { size = 10000; }
  var x = {
      aggs: {}
  };
  x.aggs[buckets] = {
    global:{}

  };

  let termAggs, filterAggs;

  if (field != null){
    termAggs = {
      buckets : {
        terms: {
          min_doc_count: 1,
          size: size,
          field: field
        }
      }
    };
  }

  if (filter != null) {
    const name = filter['filter'];
    const value = filter['value'];
    const filterfield = filter['term'];
    filterAggs = {};
    filterAggs[name] = { };
    filterAggs[name]['filter'] = {};
    filterAggs[name]['filter'][filterfield] = {};
    filterAggs[name]['filter'][filterfield] = value;

    filterAggs[name]['aggs'] = termAggs;
  }

  if ( filterAggs != null ) {
    x.aggs[buckets]['aggs'] = filterAggs;
  } else {
    x.aggs[buckets]['aggs'] = termAggs;
  }

  return x;
};

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
