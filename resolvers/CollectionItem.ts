
export const resolvers = {
	CollectionItem: {
		title(node) {			
			if ( node['title'] ) return node['title'];
			else if ( node['label'] ) return node['label']; 
		},		
		a4vId(node) {			
			if ( node['a4vId'] ) return node['a4vId'];
			else if ( node['id'] ) return node['id']; 
		},		
		type(node) {			
			if ( node['type'] ) return node['type'];
			else if ( node['parent_type'] ) return node['parent_type']; 
		}		
	}
}

