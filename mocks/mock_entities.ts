import * as Helpers from './helpers';

import { getAllTypesOfEntity } from './mock_typesOfEntity';

import { generateRandomBunchOfItemListings } from './mock_items';

import { makeRandomFieldGroups } from './mock_fields';

function makeRandomBasicEntityId():string{
    return Helpers.getRandomString(3)+"-entity-"+Helpers.getRandomString(3);
}

const allPossiblePeopleEntityLabels = [
    'Emilio Magoni', 'Alighiero Boetti', 'Carla Badiali', 'Mafonso',
    'Merz', 'Francesco Clemente', 'William Kentridge', 'Battaglia',
    'Michel Cacioppo', 'Sara Zorzi', 'Luci Rosi', 'Gerhard Richter',
    'Jonh Smith', 'Mario Rossi', 'Guido Andreotti'
];
const allPossiblePlacesEntityLabels = [
    'Torino', 'Milano', 'Bari', 'Napoli', 'Roma', 'Arezzo', 'Toscana',
    'Pisa', 'Uffizi', 'Bologna', 'Lazio', 'Grosseto', 'Arezzo', 'Massa',
    'Ancona'
];
const allPossibleConceptsEntityLabels = [
    'Ombra', 'Happening', 'Luce', 'Contemporaneo', 'Liquido', 'Spazio', 'Tempo',
    'Gassoso', 'Amore', 'Odio', 'Astratto', 'Concreto', 'Materia', 'Sentimento', 'Vita',
    'Morte', 'Paura', 'Coraggio', 'Ansia'
];
const allPossibleOrganizationsEntityLabels = [
    'Moma', 'Mac', 'Uffizi', 'Comune di Roma', 'Regione Lazio', 'Regione Toscana',
    'Comune di Pisa', 'Organization A', 'Istutito d\'arte', 'Istituzione Pisana',
    'Max', 'Mono', 'Comitato Arte Moderna', 'ModernArt'
];
const allPossibleGenericEntityLabels = [
    'Art', 'Artistic', 'Paintings', 'A', 'B', 'C', 'X', 'Y', 'Z', 'Number', 'Letter',
    'Type', 'Constraint', '1', '2', '3', '...', '#', '@', '===', '!','!!!','*<->*',
    '~','//'
];

function makeRandomBasicEntityLabel(typeOfEntityId:string):string{
    switch( typeOfEntityId ){
        case "toe-people":
            return Helpers.randomPick(allPossiblePeopleEntityLabels);
        case "toe-places":
            return Helpers.randomPick(allPossiblePlacesEntityLabels);
        case "toe-concepts":
            return Helpers.randomPick(allPossibleConceptsEntityLabels);
        case "toe-organizations":
            return Helpers.randomPick(allPossibleOrganizationsEntityLabels);
        default:
            return Helpers.randomPick(allPossibleGenericEntityLabels);
    }
}


export function makeRandomBasicEntity(typeOfEntity:any){
    return {
        id: makeRandomBasicEntityId(),
        label:makeRandomBasicEntityLabel(typeOfEntity.id),
        typeOfEntity
    }
}


let allPossibleThumbnails = [];
for(var i=30;i<150;i++) allPossibleThumbnails.push(`https://placeimg.com/${i}/${i}/any`);


export function getEntityDetails(entityId:String){
  const allToes = getAllTypesOfEntity();
  let basicEntity = makeRandomBasicEntity(Helpers.randomPick(allToes));

  let entities = [];
  const nBubbles = Helpers.getRandomIntInclusive(30,70);
  for(var i=0;i<nBubbles;i++){
    let eCdta = {
        entity: makeRandomBasicEntity(Helpers.randomPick(allToes)),
        count: Helpers.getRandomIntInclusive(1000,5000)
    };
    entities.push(eCdta);
  }

  return {
    entity: basicEntity,
    overviewTab: Helpers.randomPick(allPossibleOverviewTabs),
    fieldsTab: makeRandomFieldGroups(),
    items: generateRandomBunchOfItemListings(allPossibleThumbnails),
    entities,
    extraTabUrl: Helpers.randomPick(allPossibleExtraUrls),
    wikiTabUrl: Helpers.randomPick(allPossibleWikiUrls)
  }
}

const allPossibleExtraUrls = [
  'http://example.com/',
  'http://www.example.com/',
  'http://bead.example.com/',
  'https://agreement.example.com/',
  'http://www.example.edu/border.php#afterthought',
  'https://www.example.com/board?action=bone',
  null
];


const allPossibleWikiUrls = [
  'https://it.wikipedia.org/wiki/Lorem_ipsum',
  'https://en.wikipedia.org/wiki/Alighiero_Boetti',
  'https://it.wikipedia.org/wiki/Milano',
  'https://it.wikipedia.org/wiki/Concetto',
  null
];


const allPossibleOverviewTabs = [
 `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt
  ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
  laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in
  voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat
  non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.`,
  `Milano e' un comune italiano di 1372810 abitanti, capoluogo della regione Lombardia,
  dell'omonima citta' matropolitana, e centro di una delle piu' popolose aree metropolitane
  d'Europa. Etc...`,
  `Alighiero Boetti (1940-1994) – o Alighiero e Boetti come si firma a partire dal 1971 –
  nasce a Torino dove esordisce nell’ambito dell’Arte Povera nel gennaio del 1967.
  Nel 1972 si trasferisce a Roma, contesto più affine alla sua predilezione per il Sud del mondo.
  Già l’anno precedente ha scoperto l’Afghanistan e avviato il lavoro artistico che affida alle
  ricamatrici afghane, tra cui le Mappe, i planisferi colorati che riproporrà lungo gli anni,
  come registro dei mutamenti politici del mondo.`,
  `Il concetto (o nozione, intesa come cognizione fondamentale) in senso lato è un'idea astratta
  e generale che viene espressa in maniera definita con un procedimento che raccoglie e aggrega
  ("concetto" dal latino concipĕre = cum-capĕre, comprehendĕre) aspetti sensibili particolari che
  una molteplicità di oggetti hanno in comune. Con il concetto la mente è in grado di avere
  chiari i caratteri essenziali e costanti di una specifica realtà. Questi aspetti sostanziali,
  chiamati nella Logica "note definitorie", con il concetto saranno presenti alla mente che sarà
  in grado di riconoscere, senza dover procedere a ulteriori elaborazioni, tutti quegli oggetti
  che presentano il complesso di quelle stesse caratteristiche particolari.`
];