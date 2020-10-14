
export const resolvers = {
	EventObject: {
		id(node) {
			if(node.item.id)
				return node.item.id
		},
		start(node) {
			if(node.item.date_start)
			return node.item.date_start
    	},
		end(node) {
			if(node.item.date_start)
			return node.item.date_start
    	},
		labelStart(node) {
			if(node.item.fields.data_inizio)
			return node.item.fields.data_inizio
    	},
		labelEnd(node) {
			if(node.item.fields.data_fine)
			return node.item.fields.data_fine
    	}
	}
}

