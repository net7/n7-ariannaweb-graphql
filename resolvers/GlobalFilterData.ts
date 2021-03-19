import * as el from "../datasources/elasticsearch"
import * as config from '../assets/app-config.json';

const AGGS = "aggs";
const ENTITIES_INDEX = config['index']['entitiesIndex'] || "entities"

export const resolvers = {
	GlobalFilterData: {
    /*typeOfEntityData : async (obj, args, context, info) => {
      // request for global index
      let body = { size: 0}
      let aggr1 = el.globalAggsTerms("entity_count", "typeOfEntity", 10000, null).aggs;
      if (body[AGGS] == null){
        body[AGGS] = aggr1
      } else {
        body[AGGS]["entity_count"] = aggr1['entity_count'];
      }
      const request = el.requestBuilder(ENTITIES_INDEX, body);
      const res = await el.search(request);
      var typeOfEntityData = []
      if(res.aggregations.entity_count != undefined) {
        typeOfEntityData = res.aggregations.entity_count.buckets.buckets.map( x => {
          return {
            type: x.key,
            count: x.doc_count
          }
        })
      }
      return typeOfEntityData;
    }*/
	}
}

