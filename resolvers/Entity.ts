import { createFields } from "./utils"

export const resolvers = {
	Entity: {
		fields(entity) {
			return createFields(entity.fields)
		}
	}
}

