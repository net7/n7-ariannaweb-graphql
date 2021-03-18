const { RESTDataSource } = require('apollo-datasource-rest');
import * as config from '../assets/app-config.json';
import * as sources from '../datasources/datasources'

class Page {
    offset: number
    limit: number
}

/*export async function getCollections( collectionPagination: Page = { limit: 10000, offset: 0 }){
    
}*/

export class CollectionAPI extends RESTDataSource {
    constructor() {
        super();
        this.baseURL = config.collectionAPIUrl ?? "";
      }

    async getCollection(id: number, page: Page) {
        const {limit, offset} = page;
        const node =  await this.get(`collections/${id}?limit=${limit}&offset=${offset}`);
        
        if(node.items){
            return node;
        } else if( node.search_url ){
            const queryString = node.search_url.split("?")[1];
            const queryKeys = {};
            queryString.split("&").forEach(element => {
                let values = element.split("=");
                queryKeys[values[0]] = values[1];
            });

            var itemsToShow = limit;
            if( node.max ){
                if( limit + offset > node.max && offset == 0) 
                    itemsToShow = node.max;
                else if( limit + offset > node.max && offset > 0 ){
                    itemsToShow = node.max - offset;
                }
            }

            const searchParameters = {
                "page" : {
                    "offset": offset,
                    "limit":  itemsToShow
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
            return results;
        } 
      
    }

    async getCollections(page: Page = { limit: -1, offset: 0 }) {
        const {limit, offset} = page;
        const collection =  await this.get(`collections?limit=${limit}&offset=${offset}`);
        return collection;
    } 

}


