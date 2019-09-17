import * as Helpers from './helpers';


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