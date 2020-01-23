import { createFields } from "./utils"

export const resolvers = {
	Item: {
		fields(item) {
			return createFields(item.fields)
    },
    breadcrumbs(item, args, context, info) {
      if( item.path ){
        return item.path;
      }
      return null;
    },
    title(item, args, context, info) {
      if( item.title )
        return item.title;
      else if (item.label)
        return item.label;
    },
    label(item, args, context, info) {
      if( item.highlight && item.highlight.label && item.highlight.label[0] != "" ){
        return item.highlight.label[0];
      }
      return item.label;
    }
  },

  LinkElement: {
    link(item, args, context, info) {
      return item.id;
    }
  }
}

