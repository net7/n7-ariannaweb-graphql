
import * as sources from '../datasources/datasources'
import { queryTerm } from '../datasources/elasticsearch';

export const resolvers = {
	Collection: {
		async items(node) {
			if(node.items){
				return node.items
			} else {
				const $items = node.hits.hits.map( x => x._source );
            	return $items;
			}
		},		
		async total(node) {
			if(node.total) return node.total
			else if( node.hits.total ) return node.hits.total
		}
	}
}

