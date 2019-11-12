import { createFields } from "./utils"

export const resolvers = {
	Node: {
		fields(node) {
			return createFields(node.fields)
		}
	}
}

