import { createFields } from "./utils"

export const resolvers = {
	Entity: {
		fields(entity) {
			return createFields(entity.fields)
    },
    label(item, args, context, info) {
      if( item.highlight && item.highlight['label.ngrams'] && item.highlight['label.ngrams'][0] != "" ){
        return item.highlight['label.ngrams'][0];
      }
      return item.label;
    }
	}
}

