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
      if( item.highlight && item.highlight['label.ngrams'] && item.highlight['label.ngrams'][0] != "" ){
        return item.highlight['label.ngrams'][0];
      }
      return item.label;
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
    }
  },

  LinkElement: {
    link(item, args, context, info) {
      return item.id;
    }
  }
}

