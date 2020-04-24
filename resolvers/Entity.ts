import { createFields } from "./utils"
import * as sources from '../datasources/datasources'

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
    },
    relatedEntities(item, {id}){
      if( item.relatedEntities ){
        return item.relatedEntities.map( x => {
          return {
            entity: x,
            count: 1
          }
        });
      } else return []
        },
    async relatedItems(item, args, context, info){
      const itemPagination = item.params != null ? item.params.itemsPagination : "";
      const entitiesListSize = item.params != null ? item.params.entitiesListSize : "";
     return sources.getRelations(item.id, itemPagination, entitiesListSize);

     // return item.relatedEntities;
    }
	}
}

