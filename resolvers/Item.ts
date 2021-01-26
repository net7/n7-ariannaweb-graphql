import { createFields } from "./utils"
import { orderRelatedEntities, orderDigitalObjects } from "./utils"
import * as sources from '../datasources/datasources'

export const resolvers = {
  Item: {
    fields(item) {
      return createFields(item.fields)
    },
    breadcrumbs(item, args, context, info) {
      if (item.path) {
        item.path.shift();
        return item.path;
      }
      return null;
    },
    title(item, args, context, info) {
      if (item.title)
        return item.title;
      else if (item.label)
        return item.label;
    },
    label(item, args, context, info) {
      let hg_label = "";
      if (item.highlight && Object.keys(item.highlight).length > 0) {
        Object.keys(item.highlight).forEach(element => {
          if (hg_label == "" && item.highlight[element][0] && item.highlight[element][0] != "")
            hg_label = item.highlight[element][0];
        });
        return hg_label;
      } else {
        return item.label;
      }
    },
    relatedTypesOfEntity(item, args, context, info) {
      let entities = [];
      if (item.relatedEntities && item.relatedEntities.length > 0) {
        let countData = {};
        let checkRelatedEntities = [];
        item.relatedEntities.forEach(entity => {
          if (!countData[entity['typeOfEntity']]) {
            countData[entity['typeOfEntity']] = {
              count: 0,
              type: entity['typeOfEntity']
            }
          }
          if (checkRelatedEntities.indexOf(entity.id) < 0) {
            checkRelatedEntities.push(entity.id);
            countData[entity['typeOfEntity']].count += 1;
          }
        })

        for (const e in countData) {
          entities.push(countData[e]);
        }
        return entities;
      }
    },
    document_type(node) {
      if(node.document_type != null){
        return node.document_type;
      }
      if (node.fields.node_type != null) {
        return node.fields.node_type;
      } else return "oggetto-culturale"
    },
    document_classification(node) {
			if (node.fields.document_classification != null){
        return node.fields.document_classification
      }
    },
    images: (node) =>{
      let images = [];
      if( node["digitalObjects"] && node["digitalObjects"].length > 0 ){
        node["digitalObjects"].some(dObj => {
          if( dObj.ordine == 1 ){
            images =  dObj.images.map( img => img.url )
          }
        });

      }
      return images;
    },
    digitalObjects: (node) =>{
      return node["digitalObjects"].sort(orderDigitalObjects);
    },
    image: (node) => {
      if( node["digitalObjects"] && node["digitalObjects"].length > 0 ){
        let image = "";
        for (let element of node["digitalObjects"]) {
          if( element.doType == "IIPURLS" ){
            return element['images'][0].url + "&WID=500&CVT=jpeg";            
          } else if (element.doType == "pdf" ) {
            image = element['images'][0].url_m  ? element['images'][0].url_m : "/assets/images/arianna/pdf-thumb.jpg"; 
            return image;
          }
          else if ( element.doType == "jpg-png" ) {
            image = image == "" ? element['images'][0].url_m : image;
            return image;
          } 
        }
        return image;
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
    relatedItems(item) {
      const relatedEntitiesIds = [];
      if (item.relatedEntities != null) {
        item.relatedEntities.forEach(x => relatedEntitiesIds.push(x.id))

        const result = sources.getRelatedItems(relatedEntitiesIds.slice(0, 2),
          { limit: item.params.maxSimilarItems, offset: 0 }, 1, item.id).then(x => x.itemsPagination.items)

        return result;
      }
    }
  },
  LinkElement: {
    link(item, args, context, info) {
      return item.id;
    }

  }
}

