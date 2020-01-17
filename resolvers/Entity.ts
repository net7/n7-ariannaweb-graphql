import { createFields } from "./utils"

export const resolvers = {
	Entity: {
		fields(entity) {
			return createFields(entity.fields)
    },
    label(item, args, context, info) {
      if( item.highlight && item.highlight.label && item.highlight.label[0] != "" ){
        return item.highlight.label[0];
      }
      return item.label;
    }
	}
}

