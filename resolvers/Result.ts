
export const resolvers = {
	Result: {
		__resolveType(result, context, info) {
			if (result.id) {
				return 'Item';
			}
			else {
				return 'EntityCountData';
			}
		}
  },
  SearchResult: {
		__resolveType(result, context, info) {
			if (result.parent_type == "cultural_object") {
				return 'Item';
			}
			else {
				return 'Entity';
			}
		}
	}
}

