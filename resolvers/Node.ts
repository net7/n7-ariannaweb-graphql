import { createFields } from "./utils"
import { orderRelatedEntities, orderDigitalObjects } from "./utils"
import * as sources from '../datasources/datasources'

export const resolvers = {
	Node: {
		fields(node) {
			return createFields(node.fields)
    },
		document_type(node) {
      if (node.fields.node_type != null && node.fields.node_type  == "oc"){
        return "oggetto-culturale"
      } else return "aggregazione-logica"
    },
		document_classification(node) {
			if (node.fields.document_classification != null){
        return node.fields.document_classification
      }
    },
   /* img: (node) => {
      if( node['fields']["images"] && node['fields']["images"] .length > 0 ){
        return node['fields']["images"][0]['images'][0].url + "&WID=50&CVT=jpeg";
      }
      return "";

    },*/
    img: (node) => {
      if( node['fields']["images"] && node['fields']["images"].length > 0 ){  
        node['fields']["images"] = node['fields']["images"].sort(orderDigitalObjects);
        for (let element of node['fields']["images"]) {
          if(element['images'] && element['images'].length > 0){
            element['images'] =  element['images'].sort(orderDigitalObjects);
          } 
          if( element.doType == "iip" ){
            return element['images'][0].url + "&WID=50&CVT=jpeg";            
          } else if (element['images'] && element['images'].length > 0) {
            return element['images'][0].url_s;
          } 
        }
      }
    },
    relatedEntities(node) {
      let hashMap = {};
      let ids = [];
      if( !node.relatedEntities ) return [];

      node.relatedEntities.forEach(x => {
        if (!hashMap[x.id]) {
          hashMap[x.id]= {"entity": x, "relation": x.relation};

          ids.push(x.id);
        } else {
          if(x.relation != ""){
            hashMap[x.id]["entity"]["relation"] = hashMap[x.id]["entity"]["relation"] != "" ? hashMap[x.id]["entity"]["relation"] + ", " + x.relation :x.relation;
            hashMap[x.id]["relation"] = hashMap[x.id]["relation"] != "" ? hashMap[x.id]["relation"] +", " + x.relation : x.relation
          }
        }
      });
      const result = sources.getEntityRelatedItemsCount(ids).
      then(entitiesCount => {
        let relatedEntities = [];
        entitiesCount.forEach(element => {
          if (hashMap[element.key]) {
            hashMap[element.key]['count'] = element.cultural_objects.doc_count;
            relatedEntities.push(hashMap[element.key]);
          }
        });
        return relatedEntities.sort( orderRelatedEntities );
      })

      return result;
    },
    breadcrumbs(item, args, context, info) {
      if (item.path) {
        item.path.shift();
        return item.path;
      }
      return null;
    },
	}
}

