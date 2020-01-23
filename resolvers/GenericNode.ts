
export const resolvers = {
	GenericNode: {
		__resolveType(node, context, info) {
			if (node.relatedEntities) {
				return 'Item';
			}
			else {
				return 'Node';
			}
		}
	}
}

