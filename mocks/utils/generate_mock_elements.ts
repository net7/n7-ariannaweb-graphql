import * as Helpers from '../helpers';

import { makeRandomFieldGroups } from '../mock_fields';
import { makeRandomBasicEntityId } from '../mock_entities';
import { getAllTypesOfEntity, getTypesOfEntity } from '../mock_typesOfEntity';
import { pickNDistinctPositiveIntegers } from '../helpers';



  const allPossibleRandomItemLabels = [
    "Green squares C",
    "As Nights fall over...",
    "Pisa, la torre pendente",
    "Randomness madness",
    "Untitled Item",
    "Placeholder Item",
    "This is a Test",
    "Random Element",
    "Generic Label/Title"
  ];
  
  const allPossibleRandomItemAuthors = [
    "Giulio Andreini",
    "Romeo Zitarosa",
    "Dario Piotrowicz",
    "Edgar Gomez",
    "Duccio Duccio",
    "Chiara Aiola",
    "Anonymous",
    "Generic Author"
  ];
  
  
  const allPossibleRandomItemIcons = [
    "n7-icon-action-alt",
    "n7-icon-archive",
    "n7-icon-atlas",
    "n7-icon-biography-alt",
    "n7-icon-books",
    "n7-icon-calendar-alt",
    "n7-icon-camera",
    "n7-icon-clipboard-check",
    "n7-icon-compass",
    "n7-icon-earth",
    "n7-icon-file3",
    "n7-icon-illustration",
    "n7-icon-lightbulb"
  ];
  
  
  
  
  const allPossibleRandomItemShortDescription = [
    "Ricamo su tela cm 29 X 29",
    "Dipinto ad olio",
    "News",
    "Informazione rilevante",
    "Avviso importante",
    "Opera d'arte",
    "Capolavoro Artistico"
  ];









  const allPossibleRandomItemTexts = [
    '<html>A short text for a random item!</html>',
    '<html>This is a text for an item! maybe the filed should be called "html" instead of "text"</html>',
    '<html>A text/description for a very interesting item <br> The item also presents some interesting <b>styling</b> and even spreads across <br> multiple <br> lines </html>',
  ];
  
  
  function makeRandomItemId():String{
    return Helpers.getRandomString(3)+"-item-"+Helpers.getRandomString(3);
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



  function makeBasicEntity(typeOfEntity:any,label:string){
    return {
        id: makeRandomBasicEntityId(),
        label,
        typeOfEntity
    };
  }





  let allRandomBasicEntities = [];

  const peopleToe = getTypesOfEntity('toe-people');
  allPossiblePeopleEntityLabels.forEach( (label) => {
    allRandomBasicEntities.push(makeBasicEntity(peopleToe,label));
  });


  const placesToe = getTypesOfEntity('toe-places');
  allPossiblePlacesEntityLabels.forEach( (label) => {
    allRandomBasicEntities.push(makeBasicEntity(placesToe,label));
  });

  const conceptsToe = getTypesOfEntity('toe-concepts');
  allPossibleConceptsEntityLabels.forEach( (label) => {
    allRandomBasicEntities.push(makeBasicEntity(conceptsToe,label));
  });

  const oranizToe = getTypesOfEntity('toe-organizations');
  allPossibleOrganizationsEntityLabels.forEach( (label) => {
    allRandomBasicEntities.push(makeBasicEntity(oranizToe,label));
  });





  const numOfAllItems = 500;

  const allRandomBasicItems = [];
  const allRandomItemDetails = {};
  
  for(var i=0;i<numOfAllItems;i++){
    let basicItem = {
      id: makeRandomItemId(),
      label: Helpers.randomPick(allPossibleRandomItemLabels),
      info : [{ 
        key: 'author',
        value: Helpers.randomPick(allPossibleRandomItemAuthors)
      },
      {
        key: 'short_description',
        value: Helpers.randomPick(allPossibleRandomItemShortDescription)
      }],
      icon: Helpers.randomPick(allPossibleRandomItemIcons)
    };
    allRandomBasicItems.push(basicItem);
  
    var width = Helpers.getRandomIntInclusive(900,1800);
    var height = Helpers.getRandomIntInclusive(500,800);
  
    const allToes = getAllTypesOfEntity();
    let connectedEntities = [];
    const nBubbles = Helpers.getRandomIntInclusive(20,50);
    const entitiesPick = pickNDistinctPositiveIntegers(allRandomBasicEntities.length,nBubbles)
    for(var j=0;j<nBubbles;j++){
      let eCdta = {
          entity: allRandomBasicEntities[entitiesPick[i]],
          count: Helpers.getRandomIntInclusive(1000,5000)
      };
      connectedEntities.push(eCdta);
    }

    allRandomItemDetails[basicItem.id+''] = {
      item: basicItem,
      title: basicItem.label,
      image: `https://placeimg.com/${width}/${height}/any`,
      text: Helpers.randomPick(allPossibleRandomItemTexts),
      fields: makeRandomFieldGroups(),
      connectedEntities,
      similarItems: null, // add random pick
      breadcrumbs: [ // TODO: improve the mock!
        { label: "Collezione d'arte" },
        { label: "Collezione 1" },
        { label: "..." },
        { label: basicItem.label }
      ]
    };
  
  }







const fs = require('fs')
fs.writeFileSync('./mocks/autogenerated_mock_elements.ts',
`///////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////
////////////  AUTOGENERATED FILE WITH VARIOUS MOCK ELEMENTS ///////////////
///////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////

export const allRandomBasicItems = ${JSON.stringify(allRandomBasicItems)};


export const allRandomItemDetails = ${JSON.stringify(allRandomItemDetails)};





export const allRandomBasicEntities = ${JSON.stringify(allRandomBasicEntities)};

`);


console.log('mock_elements.ts file generated');