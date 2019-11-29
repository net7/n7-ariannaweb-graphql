
export const resolvers = {
	Result: {
		__resolveType(result, context, info) {
			if (result.item) {
				return 'ItemListing';
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

