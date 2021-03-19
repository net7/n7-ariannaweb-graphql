
export const resolvers = {
	GenericNode: {
		__resolveType(node, context, info) {
			if (node.index == "oc_index") {
				return 'Item';
			}
			else if (node.index == "tree_index") {
				return 'Node';
			}
		}
	}
}

