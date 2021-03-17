
import * as sources from '../datasources/datasources'
import { queryTerm } from '../datasources/elasticsearch';

export const resolvers = {
	Collection: {
		async items(node) {
			if(node.items)
				return node.items
			else if( node.search_url ){
				const queryString = node.search_url.split("?")[1];
				const queryKeys = {};

				queryString.split("&").forEach(element => {
					let values = element.split("=");
					queryKeys[values[0]] = values[1];
				});
				const searchParameters = {
					"page" : {
						"offset": 0,
						"limit": node.max != "" ? node.max : 0
					},
					results: {
						order: { type: "text", key: "label_sort", direction: "ASC" },
						fields: [{ id: "description", highlight: false, limit: 200 }],
					},
					"facets" : [
						{ id: "query", type: "value" },
						{
							id: "query-all",
							type: "value",
							data: [
								{
									label: "Cerca in tutti i campi delle schede",
									value: "1",
									counter: null,
								}
							]
						},
						{ id: "query-links", type: "value" },
						{
							id: "entity-types",
							type: "value",
							operator: "OR",
							limit: 10,
							order: "count",
						},
						{ id: "entity-search", type: "value" },
						{ id: "entity-links", type: "value", searchData: ["entity-type"] },
					],
					filters: [
						{
							facetId: "query",
							value: null,
							searchIn: [{ key: "label.ngrams", operator: "LIKE" }]
						},
						{
							facetId: "query-all",
							value: null,
							searchIn: [{ key: "label.ngrams^5,text^4,fields.*^3", operator: "=" }],
						},
						{
							facetId: "query-links",
							value: [],
							searchIn: [{ key: "source.entityType", operator: "=" }],
						},
						{
							facetId: "entity-links",
							value: [],
							searchIn: [{ key: "relatedEntities.id", operator: "=" }],
							pagination: { limit: 50, offset: 0 }
						}
					]				
				};

				searchParameters.filters.forEach(( filter ) => {
					if( typeof queryKeys[filter.facetId] !== "undefined" ) {
						if( typeof filter.value === "object" ) {
							filter.value =  queryKeys[filter.facetId].split(",")
						} else {
							filter.value =  queryKeys[filter.facetId]
						}
					}					
				});

				if( queryKeys['orderby'] ){
					searchParameters.results.order.key = queryKeys['orderby'];					
				}
				if( queryKeys['orderdirection'] ){
					searchParameters.results.order.direction = queryKeys['orderdirection'];					
				}

				const results = await sources.elasticSearch(searchParameters);
				const $items = results.hits.hits.map( x => x._source );
				return $items;
			}
		}		
	}
}

