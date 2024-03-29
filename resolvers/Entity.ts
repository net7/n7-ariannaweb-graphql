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
      let hashMap = {};
      let ids = [];

      if( item.relatedEntities ){


        item.relatedEntities.forEach(x => {
          if (!hashMap[x.id]) {
            hashMap[x.id]= {"entity": x, "relation": x.relation, "count": 1};
            ids.push(x.id);
          } else {
            if(x.relation != ""){
              hashMap[x.id]["entity"]["relation"] = hashMap[x.id]["entity"]["relation"] != "" ? hashMap[x.id]["entity"]["relation"] + ", " + x.relation :x.relation;
              hashMap[x.id]["relation"] = hashMap[x.id]["relation"] != "" ? hashMap[x.id]["relation"] +", " + x.relation : x.relation
              hashMap[x.id]["count"] += 1;
            }
          }
        });      
        return Object.values(hashMap);
      }
      return [];    
    
    },

    relatedItemsTotalCount(item, args, context, info) {
      const totCount = item.params != null ? item.params.relatedItems.total : null;
      return totCount;
    } ,

    async relatedItems(item, args, context, info){
      const relatedItems = item.params != null ? item.params.relatedItems.items : [];
      return relatedItems;
     /* const itemPagination = item.params != null ? item.params.itemsPagination : "";
      const entitiesListSize = item.params != null ? item.params.entitiesListSize : "";
      const response = await sources.getRelations(item.id, itemPagination, entitiesListSize);
      item['relatedItemsTotalCount'] = response.total;
      return  response.items;*/
    },
    async relatedAl(item, args, context, info){
      const relatedAl = item.params != null ? item.params.relatedAl.items : [];
      return relatedAl;
      /* 
      const itemPagination = item.params != null ? item.params.itemsPagination : "";
      const entitiesListSize = item.params != null ? item.params.entitiesListSize : "";
      return sources.getRelationsAl(item.id, itemPagination, entitiesListSize);
     */

     // return item.relatedEntities;
    },
    relatedAlTotalCount(item, args, context, info) {
      const totCount = item.params != null ? item.params.relatedAl.total : null;
      return totCount;
    } ,
	}
}

