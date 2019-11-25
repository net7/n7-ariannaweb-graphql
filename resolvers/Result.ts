
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
	}
}

