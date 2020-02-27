import { createFields } from "./utils"

export const resolvers = {
	Entity: {
		fields(entity) {
			return createFields(entity.fields)
    },
    label(item, args, context, info) {
      let hg_label = "";
      if( item.highlight && Object.keys(item.highlight).length > 0 ){
        Object.keys(item.highlight).forEach(element => {
          if( hg_label == "" && item.highlight[element][0] && item.highlight[element][0] != "" )
            hg_label = item.highlight[element][0];
        });
        return hg_label;
      } else {
        return item.label;
      }
    }
	}
}

