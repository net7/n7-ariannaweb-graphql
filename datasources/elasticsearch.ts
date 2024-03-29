import { Client } from '@elastic/elasticsearch'
import { elasticAuth as auth, elasticNodeAddress as addr, elasticFuzziness as fuzziness } from "./elasticConfig"

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
export const aggsTerms = (buckets: string, field: string = null, script: string = null, size: number = 10000, minDocCount = 1) => {
	const x = {
		aggs: {}
	}
	x.aggs[buckets] = {
		terms: {
			min_doc_count: minDocCount,
			size: size
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
 * @param script script to aggregate field in a custom way
 * @param size max number of buckets returned
 */
export const aggsNestedTerms = (
  buckets: string, 
  field: string = null, 
  script: string = null, 
  size: number = 10000,
  path = "", 
  global: boolean = false,
  include: any = null) => {

  const aggs = {
    terms: {
      min_doc_count: 1,
      size: size,
    }
  }

  if (field != null)
    aggs.terms['field'] = field
  if (script != null)
    aggs.terms['script'] = script
  if (include != null && include.length > 0)
    aggs.terms['include'] = include

  let x:any = {};
  if( global ) {
     x = {
      aggs: {},
      global: {}
    }
    x['aggs'][buckets] = {
      nested : {
        path : path
      },
      aggs:{}
    };
    x['aggs'][buckets]['aggs'][buckets] = aggs;


  }  else{
    x = {
      aggs: {},
      nested : {
        path : path
      }
    }
    x['aggs'][buckets] = aggs;
  }
	return x
}

/**
 *
 * @param buckets buckets name
 * @param field field to aggregate
 * @param size max number of buckets returned
 * @param filter object with filter field {term, value, filter}
 */
export const globalAggsTerms = function (buckets, field, size, filter, minDocCount = 1) {
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
          min_doc_count: minDocCount,
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
    filterAggs[name]['filter']['term'] = {};
    filterAggs[name]['filter']['term'][filterfield] = value;

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
 * @param buckets buckets name
 * @param field field to aggregate
 * @param size max number of buckets returned
 * @param filter object with filter field {term, value, filter}
 */
export const topHits = function (buckets, limit, offset, sort = null, minDocCount = 1, highlight = null) {

  const querysort = sort ? sort : [
          {"_score": {"order": "desc"}},
          { "label.keyword" : {"order" : "asc"}}
        ];

  const hits = {"top_hits":  {
          "size": limit,
          "from": offset,
          "sort": querysort,
          "highlight" : highlight
        }
    }

  var x = {
      aggs: {}
  };
  x.aggs[buckets] = hits;

  return x;
};

/**
 *
 * @param buckets buckets name
 * @param field field to aggregate
 * @param size max number of buckets returned
 * @param filter object with filter query
 */
export const filterAggsTerms = function (buckets, field, size, filter:{}, nested_path = "") {
  if (field === void 0) { field = null; }
  if (filter === void 0) { filter = null; }
  if (size === void 0) { size = 10000; }


  
  var x = {
      aggs: {}
  };
  x.aggs[buckets] = {};

  let termAggs, filterAggs;

  if (field != null){
    termAggs = {};
    termAggs[buckets] = {};
    termAggs[ buckets ] = {      
        terms: {
          min_doc_count: 1,
          size: size,
          field: field
        }      
    };
  }

  if ( filter != null ) {
    x.aggs[buckets]['filter'] = filter;
  }

  x.aggs[buckets]['aggs'] = termAggs;


  if( nested_path != ""){
    const nested = {
        aggs: x.aggs,
        nested : {
          path : nested_path
        }
      }
      
      x = nested;
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
export const queryString = (queryField: { fields: string[], value: string }, default_operator = "AND", boost:number = null):any => {
	const x = {
		query_string: {
			query: queryField.value,
      fields: queryField.fields,
      default_operator: default_operator,
      lenient: true,
      "fuzziness": fuzziness
		}
  }

  if (boost) {
    x.query_string['boost'] = boost;
  }

	return x
}

/**
 *
 * @param term the term to parse to obrain query string
 * @param options option to parse string
 */

export const buildQueryString = (term: string, options: any = {}) => {

  const allowWildCard = options.allowWildCard != "undefined" ? options.allowWildCard : true,
        splitString = options.splitString ? options.splitString : true,
        stripDoubleQuotes = options.stripDoubleQuotes ? options.stripDoubleQuotes : false,
        allowFuzziness = options.allowFuzziness ? options.allowFuzziness : false;

  let termToArray:any,
      queryTerms:any;

  if ( stripDoubleQuotes ){
    term = term.replace(/\\*"/g,"");
  }

  term = term.replace(/-/g,"\\\\-");

  if( splitString ) {
    termToArray = term.split(" ");
  } else {
    termToArray = [term];
  }

  if ( allowWildCard ) {
    queryTerms = termToArray.map( t => "*" + t + "*");
  } else {
    queryTerms = termToArray;
  }
  
  queryTerms =  queryTerms.join(" ");
  if( allowFuzziness ) {
    queryTerms = queryTerms + "~";
  }

  return queryTerms;

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

/**
 *
 * @param termField object containing the field name as key and the field value to search as the value
 */
export const queryTerms = (termField: any) => {
	return {
		query: {
			terms: termField
		}
  }


}
/**
 *
 * @param termField object containing the field name to check if exists
 */
export const queryExists = (termField: any) => {
	return {
    query: {
      exists: {
        field: termField
      }
    }
  }


}
