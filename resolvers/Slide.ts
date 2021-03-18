
export const resolvers = {
	Slide: {
		background(node) {		
			if( node.background && Object.keys(node.background).length > 0 ){
				return {
					"type" : Object.keys(node.background)[0],
					"value": node.background[Object.keys(node.background)[0]]
				}
			}	
		}		
	}
}

