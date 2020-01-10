import { createFields } from "./utils"

export const resolvers = {
	Item: {
		fields(item) {
			return createFields(item.fields)
    },
    breadcrumbs(obj, args, context, info) {
      return [{label: "aaaa"}];
    },
    title(item, args, context, info) {

      if( item.title )
        return item.title;
      else if (item.label)
        return item.label;

    }

	}
}

