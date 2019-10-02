import * as Helpers from '../helpers';

import { makeRandomFieldGroups } from '../mock_fields';
import { makeRandomBasicEntityId } from '../mock_entities';
import { getAllTypesOfEntity, getTypesOfEntity } from '../mock_typesOfEntity';
import { pickNDistinctPositiveIntegers } from '../helpers';



  const allPossibleRandomItemLabels = [
    'Dirty Lighthouse', 'Cavern Research Center', 'Arcane Convention Center',
    'Japanese Arcade', 'Hellish Dungeon', 'Distopian Meteor Crater',
    'Evil Dungeon Entrance', 'Misty Bunker', 'Ancient Ruins', 'Forsaken Outpost',
    'Bioluminescent Trainstation', 'Dwarvish Shop', 'Snowy City',
    'Forsaken Trainstation', 'Evil Hangar', 'Tundra Camp', 'Horror Mill',
    'Weathered Insane Asylum', 'Collapsing Town Center', 'Self-Sufficient Farm Fields',
    'Sports in the clubhouse', 'Job in a sand castle',
    'Discoveries in an underground lair', 'Death in a bus stop',
    'Loyalty in the playground', 'Bad day in the forest',
    'False accusations in a wasteland', 'Comfort of a wasteland',
    'Bag of money in a construction yard', 'Incident in the playground',
    'Personification of a waterfall', 'Reunited in a cartoon universe',
    'War of the town hall', 'Vacation in a laboratory', 'Guilt in a forgotten bunker',
    'Fresh start in an underground lair', 'Audience in a circus',
    'Changes in the playground', 'Long lost twin in the sport stadium',
    'Insecurity in a sand castle', 'Car accident with your wife',
    'Celebrating an anniversary with your wife', 'Cheated by a dog',
    'Making history with a minotaur', 'New year\'s eve with a blind person',
    'Fight to death with an alien', 'Wrong choice of a professional thief',
    'Day at the beach with the boy scouts', 'Guarding your house with an Olympic athlete',
    'Surprise party for your complete opposite'
  ];
  
  const allPossibleRandomItemAuthors = [
    'Egidio Crifasi', 'Mario Castoro', 'Furio Melchiorre', 'Iginio Scaccia',
    'Araldo Finizio', 'Fuscolo Miserendino', 'Rubiano Ciotola', 'Silverio Francia',
    'Ippolito Sarli', 'Virone Marcantonio', 'Sibilla Torino', 'Marcella Tonelli',
    'Annabella De Lucchi', 'Minervina Cinotti', 'Virginia Alterio', 'Ornella Caterina',
    'Gertrude Cangemi', 'Zosima Cecere', 'Andromeda Piccininni', 'Ivetta Castelli',
    'Enzo Morgese', 'Valfrido Capozza', 'Pupolo Ferranti', 'Zanobi Sartini',
    'Annibale Mucci', 'Guerrino Moglia', 'Ildebrando Borsari', 'Italo Casa',
    'Archimede Cina', 'Semiramide Tambasco'
  ];
  
  const allPossibleRandomItemIcons = [
    "n7-icon-action-alt", "n7-icon-archive", "n7-icon-atlas", "n7-icon-biography-alt",
    "n7-icon-books", "n7-icon-calendar-alt", "n7-icon-camera", "n7-icon-clipboard-check",
    "n7-icon-compass", "n7-icon-earth", "n7-icon-file3", "n7-icon-illustration",
    "n7-icon-lightbulb"
  ];


  let allPossibleRandomItemShortDescriptionTmp = [
    "Dipinto ad olio", "News", "Informazione rilevante", "Avviso importante",
    "Opera d'arte", "Capolavoro Artistico", "Idea innovativa", "Creazione moderna",
    "Gamechanger", "Opera artistica", "Concetto d'arte", "Innovazione", "Mostra d'arte",
    "Creazione", "Modello", "Fotografia", "Opera d'arte tessile", "Installazione artistica"
  ];
  [29,35,56].forEach( (n) => {
    allPossibleRandomItemShortDescriptionTmp.push(`Ricamo su tela cm ${n} X ${n}`);
  });
  [20,60].forEach( (n) => {
    allPossibleRandomItemShortDescriptionTmp.push(`Ricamo su tela cm ${n} X ${n/2}`);
  });
  [30,50,90].forEach( (n) => {
    allPossibleRandomItemShortDescriptionTmp.push(`Quadro cm ${n} X ${n}`);
  });
  const allPossibleRandomItemShortDescription = allPossibleRandomItemShortDescriptionTmp;







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
    'Jonh Smith', 'Mario Rossi', 'Guido Andreotti', 'Pasqualino	Fes'
    ,'Gianluigi	Sio'  ,'Silvia	Cavaleri'  ,'Maria	Malara'  ,'Silvana	Curci'
    ,'Carmine	Ciarallo'  ,'Paolo	Gaetani'  ,'Mauro	Mammucari'
    ,'Davide	Leoca'  ,'Valeria	Leopardi'  ,'Paola	Sardelli'  ,'Giacomo	Sonaglia'
    ,'Nicola	Parzia'  ,'Armando	De Matt'  ,'Egidio	Minnucci'  ,'Ignazio	Bio'
    ,'Lanfranco	Finocchioli'  ,'Antonio	Zucchiatti'  ,'Michelangelo	Sassi'  ,'Santo Antonino	Coppola'
    ,'Francesco	Licciardi'  ,'Davide	Tedeschi'  ,'Duilio	Ro'  ,'Silvano	Palmisa'
    ,'Marina	Meleleo'  ,'Daniela	Polchi'  ,'Angelo	Bottaro'  ,'Maria	Ferrara'
    ,'Antonello	Maiorano'  ,'Daniele	Falanga'  ,'Valentina	Griga'  ,'Valerio	Doddi'
    ,'Maria Giulia	Pagliaroli'  ,'Pietro	Olivieri' ,'Maria Teresa	Inciocchi'  ,'Domenico Mauro	Conoscen'
    ,'Alex	Vriz'  ,'Giovani	Gabassi'  ,'Stefano	Pan' ,'Mariella	Capomolla'
    ,'Stefania	Tiralongo'  ,'Anna	Di Pasquale'  ,'Mirella	Paoletti'
    ,'Genny	Ramundo'  ,'Carlos	Passoni'  ,'Sara	Garri'
    ,'Paola Nazzarena	Ferretti'  ,'Fosca Nota Fosca Arte	Manca'  ,'Gioacchino	Spera'
    ,'Giuseppe (noto) Pino	Congiu Manca'  ,'Alfredo	Ferri'  ,'Svetlana	Potoran'  ,'Mario	Fanuli'
    ,'Gianfranco	Serafin'  ,'Francesco	Startari'  ,'Zanfranco	Finocchio'  ,'Antonello	Maiorano'
    ,'Gabriella	Tolli'  ,'Andrea	Palermo'  ,'Elena	Cricenti'  ,'Umberto	Stefanini'
    ,'Il Mondo Della Cornice	Di Merchion' ,'Paolo	Federico'  ,'Rosanna	Miccolis'
    ,'Francesca	Mosetti'  ,'Antonello	Maiorano'  ,'Giovanni Comodo	Gi.co.'  ,'Tiziana	Nicolai'
    ,'Nanda	Rago'  ,'Andrea	Petrucci'  ,'Antonello	Maiorano'  ,'Sery	Mastropietro'
    ,'Guerino	Casella'  ,'Giovani	Gabassi'  ,'Eltjon	Valle'  ,'Battistel	Giovanni'
    ,'Armando	De Matt'  ,'Renzo	Tonel'  ,'Giuseppina	Perugini'
    ,'Claudia	Piccoli'  ,'Eltjon	Valle'  ,'Massimiliano	De Sena'  ,'Carlo	Gatti'
    ,'Nadia	Guglielmo'  ,'Tamara	Pierbattisti'  ,'Antonino	Ferro'
    ,'Nanda	Rago'  ,'Anna	Di Pasquale'  ,'Alessandro	Golfi'  ,'Vincenzo	Valenziano'  ,'Michele	Galletta'
  ];


  const allPossiblePlacesEntityLabels = [
      'Torino', 'Milano', 'Bari', 'Napoli', 'Roma', 'Arezzo', 'Toscana',
      'Pisa', 'Uffizi', 'Bologna', 'Lazio', 'Grosseto', 'Arezzo', 'Massa',
      'Ancona', 'Palermo','Genova','Firenze','Catania','Venezia','Verona','Messina',
      'Padova','Trieste','Taranto','Brescia','Parma','Prato','Modena','Reggio Calabria',
      'Reggio Emilia','Perugia','Ravenna','Livorno','Cagliari','Foggia','Rimini',
      'Salerno','Ferrara','Sassari','Latina','Giugliano in Campania','Monza','Siracusa',
      'Pescara','Bergamo','Forlì','Trento','Vicenza','Terni','Bolzano','Novara',
      'Piacenza','Ancona','Andria','Arezzo','Udine','Cesena','Lecce'
  ];


  const allPossibleConceptsEntityLabels = [
      'Ombra', 'Happening', 'Luce', 'Contemporaneo', 'Liquido', 'Spazio', 'Tempo',
      'Gassoso', 'Amore', 'Odio', 'Astratto', 'Concreto', 'Materia', 'Sentimento', 'Vita',
      'Morte', 'Paura', 'Coraggio', 'Ansia', 'Pigment','Paint', 'Canvas','Panel',
      'Paper','Plaster','Linseed oil','Graphite','Charcoal','Pastels','Clay','Stone',
      'Watercolor','Tempera','Gouache','Casein paint','Ink','Light','Pencil','Wood',
      'Ivory','Ceramic','Stoneware','Metal','Plastic','Plexiglass','Fiberglass',
      'Glass','Wax','Fabric','Thread','Yarn','Film','Glaze','Pen','Crayon',
      'Vitreous enamel','Lacquer','Gelatin','Hide','Vellum and parchment','Glitter',
      'Art techniques','Aquatint','Cameraless photography',,'Casting','Chromoxylography',
      'Cloisonné','Damascening','Drawing','Drypoint','Embroidery','Encaustic',
      'Engraving','Engraved gem','Etching','Filigree','Fresco','Gilding','Glassblowing',
      'Goldsmithing','Gouache','Linocut','Lithography',
      'Lost-wax casting','Mezzotint','Modeling','Monotype','Oil painting',
      ,'Intaglio printing','Planographic printing','Pottery','Printmaking','Relief',
      'Relief printing','Sculpture','Seriography','Stippling','Tapestry','Paper cutting',
      'Photography','Slipcasting','Watercolor','Weaving','Woodcut'
  ];
  const allPossibleOrganizationsEntityLabels = [
      'Moma', 'Mac', 'Uffizi', 'Comune di Roma', 'Regione Lazio', 'Regione Toscana',
      'Comune di Pisa', 'Organization A', 'Istutito d\'arte', 'Istituzione Pisana',
      'Max', 'Mono', 'Comitato Arte Moderna', 'ModernArt','Wolf Systems','Raptor Systems',
      'Whiz Co.','Silver Linetworks','Grottolutions','Solsticetems','Tucanterprises',
      'Tigernite','Marswheels','Nimbleworks','Prodigy Brews','Zeus Foods','Smile Limited',
      'Wooductions','Equinetworks','Signetworks','Quaductions','Apexwood','Vortexbooks',
      'Oakcast','Neptune Security','Zeus Technologies','Apricot Networks','Aprico',
      'Shrubrews','Smilectronics','Neroductions','Websys','Tigerking','Alligatorshack',
      'Beedle','Crow Lighting','Grizzly Motors','Spiritechnologies','Marsecuriy',
      'Raptolutions','Electrorks','Pinkex','Marshstones','Thunderwalk'
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
  
  for(let i=0;i<numOfAllItems;i++){
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
  
    let connectedEntities = [];
    const nBubbles = Helpers.getRandomIntInclusive(20,50);
    const entitiesPick = pickNDistinctPositiveIntegers(allRandomBasicEntities.length,nBubbles)
    for(let j=0;j<nBubbles;j++){
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
      similarItems: null,
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