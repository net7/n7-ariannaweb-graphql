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
    overviewTab: "Milano e' un comune italiano di 1372810 abitanti," +
                 " capoluogo della regione Lombardia, dell'omonima citta' matropolitana," +
                 " e centro di una delle piu' popolose aree metropolitane d'Europa. Etc...",
    fieldsTab: makeRandomFieldGroups(),
    Items: generateRandomBunchOfItemListings(allPossibleThumbnails),
    entities,
    extraTabUrl: null,
    wikiTabUrl: null
  }
}