import { createFields } from "./utils"

export const resolvers = {
	Item: {
		fields(item) {
			return createFields(item.fields)
    },
    breadcrumbs(item, args, context, info) {
      if( item.path ){
        item.path.shift();
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
    },
    relatedTypesOfEntity(item, args, context, info) {
      let entities = [];
      if ( item.relatedEntities && item.relatedEntities.length > 0 ){
        let countData = {};
        let checkRelatedEntities = [];
        item.relatedEntities.forEach(entity => {
          if (!countData[entity['typeOfEntity']]) {
            countData[entity['typeOfEntity']] = {
              count: 0,
              type: entity['typeOfEntity']
            }
          }
          if (checkRelatedEntities.indexOf(entity.id) < 0 ) {
            checkRelatedEntities.push(entity.id);
            countData[entity['typeOfEntity']].count += 1;
          }
        })

        for (const e in countData) {
          entities.push( countData[e] );
        }
        return entities;
      }
    },
    document_type(node) {
      if (node.fields.node_type != null){
        return node.fields.node_type;
      } else return "oggetto-culturale"
    }
  },

  LinkElement: {
    link(item, args, context, info) {
      return item.id;
    }

  }
}

