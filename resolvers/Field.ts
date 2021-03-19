
export const resolvers = {
	Field: {
		__resolveType(field, context, info) {
			if (field.fields) {
				return 'KeyValueFieldGroup';
			}
			if (field.key) {
				return 'KeyValueField';
			}
			return null;
		}
	}
}

