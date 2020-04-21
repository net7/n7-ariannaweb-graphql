import { createFields } from "./utils"
import * as sources from '../datasources/datasources'


const images_base = {
  196:
  [
    "http://iipserver.hyperborea.com/fast/iipsrv1.fcgi?FIF=/mnt/links/unifi/BibliotecadiScienzeTecnologiche/FondoGiuseppeGiorgioGori1906-1969/Documentiscolasticiesercitazioniuniversitarie/0002_001_2b.tif",
    "http://iipserver.hyperborea.com/fast/iipsrv1.fcgi?FIF=/mnt/links/unifi/BibliotecadiScienzeTecnologiche/FondoGiuseppeGiorgioGori1906-1969/Documentiscolasticiesercitazioniuniversitarie/0002_002_2f.tif",
  ],
  172: ["http://iipserver.hyperborea.com/fast/iipsrv1.fcgi?FIF=/mnt/links/unifi/BibliotecadiScienzeTecnologiche/FondoGiuseppeGiorgioGori1906-1969/Concorsiuniversitari/ConcorsoallacattedradiArchitetturaediComposizionearchitettonicaallaFacoltdIngegneriadellUniversitdiNapoli1950/0002_001_2a.tif"],
  92:[
    "http://iipserver.hyperborea.com/fast/iipsrv1.fcgi?FIF=/mnt/links/unifi/BibliotecadiScienzeTecnologiche/FondoGiuseppeGiorgioGori1906-1969/Concorsiuniversitari/ConcorsoallacattedradiArchitetturaediComposizionearchitettonicaallaFacoltdIngegneriadellUniversitdiNapoli1950/0003_001_3a.tif",
  "http://iipserver.hyperborea.com/fast/iipsrv1.fcgi?FIF=/mnt/links/unifi/BibliotecadiScienzeTecnologiche/FondoGiuseppeGiorgioGori1906-1969/Concorsiuniversitari/ConcorsoallacattedradiArchitetturaediComposizionearchitettonicaallaFacoltdIngegneriadellUniversitdiNapoli1950/0004_001_4b.tif"
  ]
}
/*"http://iipserver.hyperborea.com/fast/iipsrv1.fcgi?FIF=/mnt/links/unifi/BibliotecadiScienzeTecnologiche/FondoFrancescoRodolico/Soggettiarchitettonici/Umbria/0280_0002_Spello.tif",
"http://iipserver.hyperborea.com/fast/iipsrv1.fcgi?FIF=/mnt/links/unifi/BibliotecadiScienzeTecnologiche/FondoGiuseppeGiorgioGori1906-1969/Concorsiuniversitari/ConcorsoallacattedradiArchitetturaediComposizionearchitettonicaallaFacoltdIngegneriadellUniversitdiNapoli1950/0003_001_3a.tif",
"http://iipserver.hyperborea.com/fast/iipsrv1.fcgi?FIF=/mnt/links/unifi/BibliotecadiScienzeTecnologiche/FondoGiuseppeGiorgioGori1906-1969/Concorsiuniversitari/ConcorsoallacattedradiArchitetturaediComposizionearchitettonicaallaFacoltdIngegneriadellUniversitdiNapoli1950/0004_001_4b.tif",
"http://iipserver.hyperborea.com/fast/iipsrv1.fcgi?FIF=/mnt/links/unifi/BibliotecadiScienzeTecnologiche/FondoFrancescoRodolico/Soggettiarchitettonici/Umbria/0282_0001_Spoleto.tif",
"http://iipserver.hyperborea.com/fast/iipsrv1.fcgi?FIF=/mnt/links/unifi/BibliotecadiScienzeTecnologiche/FondoFrancescoRodolico/Soggettiarchitettonici/Umbria/0283_0005_Spoleto.tif",
"http://iipserver.hyperborea.com/fast/iipsrv1.fcgi?FIF=/mnt/links/unifi/BibliotecadiScienzeTecnologiche/FondoFrancescoRodolico/Soggettiarchitettonici/Umbria/0280_0002_Spello.tif"*/

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
      if (node.fields.node_type != null) {
        return node.fields.node_type;
      } else return "oggetto-culturale"
    },
    image: (root) =>{
      console.log(root)
      return images_base[root.itemId];
    },
    relatedEntities(node) {
      let hashMap = {};
      let ids = [];
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
        return relatedEntities;
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

