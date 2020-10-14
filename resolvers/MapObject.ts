
export const resolvers = {
	MapObject: {
		lat(node) {
			if(node.item.fields.coordinate && node.item.fields.coordinate.latitudine)
				return node.item.fields.coordinate.latitudine
		},
		lon(node) {
			if(node.item.fields.coordinate && node.item.fields.coordinate.longitudine)
			return node.item.fields.coordinate.longitudine
    }
	}
}

