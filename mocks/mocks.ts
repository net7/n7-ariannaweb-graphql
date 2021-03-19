// For mockup reference see : https://projects.invisionapp.com/share/WGPPAPIE6N2

// import * as Mock_TypesOfEntity from './mock_typesOfEntity';
// import * as Mock_Entities from './mock_entities';
// import * as Mock_Items from './mock_items';
import * as Mock_Trees from './mock_trees';
// import * as Mock_Filters from './mock_filters';
// import * as Mock_Autocomplete from './mock_autocomplete';

const images =[
  "http://iipserver.hyperborea.com/fast/iipsrv1.fcgi?FIF=/mnt/links/unifi/BibliotecadiScienzeTecnologiche/FondoGiuseppeGiorgioGori1906-1969/Documentiscolasticiesercitazioniuniversitarie/0002_001_2b.tif&WID=400&CVT=jpeg",
  "http://iipserver.hyperborea.com/fast/iipsrv1.fcgi?FIF=/mnt/links/unifi/BibliotecadiScienzeTecnologiche/FondoGiuseppeGiorgioGori1906-1969/Concorsiuniversitari/ConcorsoallacattedradiArchitetturaediComposizionearchitettonicaallaFacoltdIngegneriadellUniversitdiNapoli1950/0002_001_2a.tif&WID=50&CVT=jpeg",
  "http://iipserver.hyperborea.com/fast/iipsrv1.fcgi?FIF=/mnt/links/unifi/BibliotecadiScienzeTecnologiche/FondoGiuseppeGiorgioGori1906-1969/Concorsiuniversitari/ConcorsoallacattedradiArchitetturaediComposizionearchitettonicaallaFacoltdIngegneriadellUniversitdiNapoli1950/0003_001_3a.tif&WID=50&CVT=jpeg",
  "http://iipserver.hyperborea.com/fast/iipsrv1.fcgi?FIF=/mnt/links/unifi/BibliotecadiScienzeTecnologiche/FondoGiuseppeGiorgioGori1906-1969/Concorsiuniversitari/ConcorsoallacattedradiArchitetturaediComposizionearchitettonicaallaFacoltdIngegneriadellUniversitdiNapoli1950/0004_001_4b.tif&WID=50&CVT=jpeg",
  "http://iipserver.hyperborea.com/fast/iipsrv1.fcgi?FIF=/mnt/links/unifi/BibliotecadiScienzeTecnologiche/FondoFrancescoRodolico/Soggettiarchitettonici/Umbria/0280_0002_Spello.tif&WID=50&CVT=jpeg",
  "http://iipserver.hyperborea.com/fast/iipsrv1.fcgi?FIF=/mnt/links/unifi/BibliotecadiScienzeTecnologiche/FondoGiuseppeGiorgioGori1906-1969/Concorsiuniversitari/ConcorsoallacattedradiArchitetturaediComposizionearchitettonicaallaFacoltdIngegneriadellUniversitdiNapoli1950/0003_001_3a.tif&WID=50&CVT=jpeg",
  "http://iipserver.hyperborea.com/fast/iipsrv1.fcgi?FIF=/mnt/links/unifi/BibliotecadiScienzeTecnologiche/FondoGiuseppeGiorgioGori1906-1969/Concorsiuniversitari/ConcorsoallacattedradiArchitetturaediComposizionearchitettonicaallaFacoltdIngegneriadellUniversitdiNapoli1950/0004_001_4b.tif&WID=50&CVT=jpeg",
  "http://iipserver.hyperborea.com/fast/iipsrv1.fcgi?FIF=/mnt/links/unifi/BibliotecadiScienzeTecnologiche/FondoFrancescoRodolico/Soggettiarchitettonici/Umbria/0282_0001_Spoleto.tif&WID=50&CVT=jpeg",
  "http://iipserver.hyperborea.com/fast/iipsrv1.fcgi?FIF=/mnt/links/unifi/BibliotecadiScienzeTecnologiche/FondoFrancescoRodolico/Soggettiarchitettonici/Umbria/0283_0005_Spoleto.tif&WID=50&CVT=jpeg",
  "http://iipserver.hyperborea.com/fast/iipsrv1.fcgi?FIF=/mnt/links/unifi/BibliotecadiScienzeTecnologiche/FondoFrancescoRodolico/Soggettiarchitettonici/Umbria/0280_0002_Spello.tif&WID=50&CVT=jpeg"
]


const images_base =[
  "http://iipserver.hyperborea.com/fast/iipsrv1.fcgi?FIF=/mnt/links/unifi/BibliotecadiScienzeTecnologiche/FondoGiuseppeGiorgioGori1906-1969/Documentiscolasticiesercitazioniuniversitarie/0002_001_2b.tif",
  "http://iipserver.hyperborea.com/fast/iipsrv1.fcgi?FIF=/mnt/links/unifi/BibliotecadiScienzeTecnologiche/FondoGiuseppeGiorgioGori1906-1969/Concorsiuniversitari/ConcorsoallacattedradiArchitetturaediComposizionearchitettonicaallaFacoltdIngegneriadellUniversitdiNapoli1950/0002_001_2a.tif",
  "http://iipserver.hyperborea.com/fast/iipsrv1.fcgi?FIF=/mnt/links/unifi/BibliotecadiScienzeTecnologiche/FondoGiuseppeGiorgioGori1906-1969/Concorsiuniversitari/ConcorsoallacattedradiArchitetturaediComposizionearchitettonicaallaFacoltdIngegneriadellUniversitdiNapoli1950/0003_001_3a.tif",
  "http://iipserver.hyperborea.com/fast/iipsrv1.fcgi?FIF=/mnt/links/unifi/BibliotecadiScienzeTecnologiche/FondoGiuseppeGiorgioGori1906-1969/Concorsiuniversitari/ConcorsoallacattedradiArchitetturaediComposizionearchitettonicaallaFacoltdIngegneriadellUniversitdiNapoli1950/0004_001_4b.tif",
  "http://iipserver.hyperborea.com/fast/iipsrv1.fcgi?FIF=/mnt/links/unifi/BibliotecadiScienzeTecnologiche/FondoFrancescoRodolico/Soggettiarchitettonici/Umbria/0280_0002_Spello.tif",
  "http://iipserver.hyperborea.com/fast/iipsrv1.fcgi?FIF=/mnt/links/unifi/BibliotecadiScienzeTecnologiche/FondoGiuseppeGiorgioGori1906-1969/Concorsiuniversitari/ConcorsoallacattedradiArchitetturaediComposizionearchitettonicaallaFacoltdIngegneriadellUniversitdiNapoli1950/0003_001_3a.tif",
  "http://iipserver.hyperborea.com/fast/iipsrv1.fcgi?FIF=/mnt/links/unifi/BibliotecadiScienzeTecnologiche/FondoGiuseppeGiorgioGori1906-1969/Concorsiuniversitari/ConcorsoallacattedradiArchitetturaediComposizionearchitettonicaallaFacoltdIngegneriadellUniversitdiNapoli1950/0004_001_4b.tif",
  "http://iipserver.hyperborea.com/fast/iipsrv1.fcgi?FIF=/mnt/links/unifi/BibliotecadiScienzeTecnologiche/FondoFrancescoRodolico/Soggettiarchitettonici/Umbria/0282_0001_Spoleto.tif",
  "http://iipserver.hyperborea.com/fast/iipsrv1.fcgi?FIF=/mnt/links/unifi/BibliotecadiScienzeTecnologiche/FondoFrancescoRodolico/Soggettiarchitettonici/Umbria/0283_0005_Spoleto.tif",
  "http://iipserver.hyperborea.com/fast/iipsrv1.fcgi?FIF=/mnt/links/unifi/BibliotecadiScienzeTecnologiche/FondoFrancescoRodolico/Soggettiarchitettonici/Umbria/0280_0002_Spello.tif"
]

// mock per le varie query
export const mocks = {
  Query:() => ({
    // getAllTypesOfEntity: Mock_TypesOfEntity.getAllTypesOfEntity ,
    // getAllBasicItems: (_,args) => Mock_Items.getAllBasicItems(),// used only for testing the mocks, not to be included in resolvers
    // getItem: (_,args) => Mock_Items.getItem(args.itemId, args.maxSimilarItems),
    // getEntity: (_,args) => Mock_Entities.getEntity(args.entityId),
    getTreeOfItems: (_parent, args, context, info) => Mock_Trees.getTreeOfItems(args.treeId),
    // globalFilter: (_,args) => Mock_Filters.getGlobalFilterResult( args ),
    // autoComplete: (_,args) => Mock_Autocomplete.autocomplete( args ),
    // getAllEntities: () => Mock_Entities.getAllEntities()
  }),
  Mutation: () => ({
  }),
  Node: () => ({
    image: (root) =>{
      return images[root.itemId.toString().substring(0,1)];
    },
    img: (node) =>{
      if (node.fields.node_type != null && node.fields.node_type  == "oc"){
        return images[node.itemId.toString().substring(0,1)];
      }
    },

  }),
  Item: () => ({
    image: (root) =>{
      return images[root.itemId.toString().substring(0,1)];
    }
  })
};
