
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
			if(node.item.date_end)
			return node.item.date_end
    	},
		label(node) {
			let label = "";
			if(node.item.fields.data_inizio)
				label = node.item.fields.data_inizio
				
			if(node.item.fields.data_fine && node.item.fields.data_fine !== node.item.fields.data_inizio)
				label = label == "" ?  node.item.fields.data_fine : label + " - " + node.item.fields.data_fine

				return label;
    	}
	}
}

