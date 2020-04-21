import { createFields } from "./utils"
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

const images_base = {
  196:"http://iipserver.hyperborea.com/fast/iipsrv1.fcgi?FIF=/mnt/links/unifi/BibliotecadiScienzeTecnologiche/FondoGiuseppeGiorgioGori1906-1969/Documentiscolasticiesercitazioniuniversitarie/0002_001_2b.tif&WID=50&CVT=jpeg",
  172: "http://iipserver.hyperborea.com/fast/iipsrv1.fcgi?FIF=/mnt/links/unifi/BibliotecadiScienzeTecnologiche/FondoGiuseppeGiorgioGori1906-1969/Concorsiuniversitari/ConcorsoallacattedradiArchitetturaediComposizionearchitettonicaallaFacoltdIngegneriadellUniversitdiNapoli1950/0002_001_2a.tif&WID=50&CVT=jpeg",
  92:"http://iipserver.hyperborea.com/fast/iipsrv1.fcgi?FIF=/mnt/links/unifi/BibliotecadiScienzeTecnologiche/FondoGiuseppeGiorgioGori1906-1969/Concorsiuniversitari/ConcorsoallacattedradiArchitetturaediComposizionearchitettonicaallaFacoltdIngegneriadellUniversitdiNapoli1950/0003_001_3a.tif&WID=50&CVT=jpeg",
}

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
    img: (node) =>{
        return images_base[node.itemId];
    },
	}
}

