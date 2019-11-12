import { createFields } from "./utils"

export const resolvers = {
	Item: {
		fields(item) {
			return createFields(item.fields)
		}
	}
}

