import * as Helpers from '../helpers';

import { makeRandomFieldGroups } from '../mock_fields';
import { makeRandomBasicEntityId } from '../mock_entities';
import { getTypesOfEntity } from '../mock_typesOfEntity';
import { pickNDistinctPositiveIntegers } from '../helpers';



const allPossibleRandomItemLabels = [
  "Guy", "Vip", "Gas", "Map", "Yes", "Six", "God",
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
  'Surprise party for your complete opposite', 'Pittore fiammingo originario probabilmente di Liegi, fu attivo in Italia nel XVII secolo. Trasferitosi a Genova, divenne cognato ed allievo di Giovanni Rosa, pittore fiammingo naturalizzato italiano. Ispirandosi al maestro, fu soprattutto autore di nature morte e collaborò durante il suo soggiorno nel capoluogo ligure con il pittore genovese Domenico Fiasella.',
  'Nell\'895 ha inizio la conquista della pianura pannonica a opera delle stirpi ungare. Il loro insediamento provocò una divisione all\'interno dell\'area linguistica slava: da quel momento in poi non vi fu più alcun contatto geografico tra lo slavo orientale e occidentale da un lato e lo slavo meridionale, a cui fa capo anche il croato, dall\'altro.',
  'Il Partito Socialista dei Lavoratori della Germania (in tedesco Sozialistische Arbeiterpartei Deutschlands, SAPD), o Partito Socialista dei Lavoratori (Sozialistische Arbeiterpartei, SAP), noto anche come Partito Socialista Operaio della Germania, fu un partito di sinistra socialista e marxista fondato il 04 ottobre 1931 a Berlino.',
  'Tirrenia – Compagnia Italiana di Navigazione è una società italiana di trasporti marittimi. Con le sue navi merci e passeggeri collega diversi porti italiani e del Mar Mediterraneo, garantendo la continuità territoriale con le isole (Sardegna, Sicilia, Isole Tremiti) durante tutto l\'arco dell\'anno. La stessa venne fondata nel 2012 a Napoli, quando Compagnia Italiana di Navigazione si aggiudicò la gara per l\'acquisizione di Tirrenia di Navigazione.',
  'Maria studiò medicina a Genova con Enrico Morselli e Edoardo Maragliano. Si laurea nel 1915 con Dante Pacchioni, direttore della clinica pediatrica, con una tesi sull\'acondroplasia. Per condurre una serie di osservazioni legate alla sua tesi cominciò a lavorare al San Lazzaro, l\'ospedale psichiatrico di Reggio nell\'Emilia, dove conobbe e sposò l\'illustre psichiatra Aldo Bertolani, poi succeduto a Giuseppe Guicciardi nella direzione del manicomio nel 1929.',
  'Al censimento del 2001 la popolazione di Paduvilayi assommava a 19.167 persone, delle quali 9.279 maschi e 9.888 femmine. I bambini di età inferiore o uguale ai sei anni assommavano a 2.199, dei quali 1.119 maschi e 1.080 femmine. Infine, coloro che erano in grado di saper almeno leggere e scrivere erano 15.695, dei quali 7.909 maschi e 7.786 femmine.',
  'I disagi arrecati costringono il comandante ad anticipare l\'atterraggio a Terranova, con la donna di nuovo fermata e ormai totalmente invisa a tutti i passeggeri. A questo punto Carson comunica in privato al comandante che Kyle Pratt avrebbe inscenato il tutto solo per poter avere un cospicuo riscatto (50 milioni di dollari) in forza di una bomba collocata nella bara del marito nella stiva, pronta ad esplodere.',
  'Dopo la morte del marito, l\'ingegnere aeronautico Kyle Pratt vola da Berlino a New York, assieme alla figlia Julia, per riportare la bara del marito a casa, a Long Island. Addormentatasi, al suo risveglio non trova più la figlia, scomparsa nel nulla. Inizia così una sorta di incubo con la ricerca frenetica della figlia che nessuno ha mai visto, non risulta essere nella lista passeggeri, e addirittura secondo l\'obitorio di Berlino sarebbe morta col padre, misteriosamente caduto dal tetto di un edificio.'];

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
[29, 35, 56].forEach((n) => {
  allPossibleRandomItemShortDescriptionTmp.push(`Ricamo su tela cm ${n} X ${n}`);
});
[20, 60].forEach((n) => {
  allPossibleRandomItemShortDescriptionTmp.push(`Ricamo su tela cm ${n} X ${n / 2}`);
});
[30, 50, 90].forEach((n) => {
  allPossibleRandomItemShortDescriptionTmp.push(`Quadro cm ${n} X ${n}`);
});
const allPossibleRandomItemShortDescription = allPossibleRandomItemShortDescriptionTmp;







const allPossibleRandomItemTexts = [
  '<html>A short text for a random item!</html>',
  '<html>This is a text for an item! maybe the filed should be called "html" instead of "text"</html>',
  '<html>A text/description for a very interesting item <br> The item also presents some interesting <b>styling</b> and even spreads across <br> multiple <br> lines </html>',
];


function makeRandomItemId(): String {
  return Helpers.getRandomString(3) + "-item-" + Helpers.getRandomString(3);
}


const allPossiblePeopleEntityLabels = [
  'Emilio Magoni', 'Alighiero Boetti', 'Carla Badiali', 'Mafonso',
  'Merz', 'Francesco Clemente', 'William Kentridge', 'Battaglia',
  'Michel Cacioppo', 'Sara Zorzi', 'Luci Rosi', 'Gerhard Richter',
  'Jonh Smith', 'Mario Rossi', 'Guido Andreotti', 'Pasqualino	Fes'
  , 'Gianluigi	Sio', 'Silvia	Cavaleri', 'Maria	Malara', 'Silvana	Curci'
  , 'Carmine	Ciarallo', 'Paolo	Gaetani', 'Mauro	Mammucari'
  , 'Davide	Leoca', 'Valeria	Leopardi', 'Paola	Sardelli', 'Giacomo	Sonaglia'
  , 'Nicola	Parzia', 'Armando	De Matt', 'Egidio	Minnucci', 'Ignazio	Bio'
  , 'Lanfranco	Finocchioli', 'Antonio	Zucchiatti', 'Michelangelo	Sassi', 'Santo Antonino	Coppola'
  , 'Francesco	Licciardi', 'Davide	Tedeschi', 'Duilio	Ro', 'Silvano	Palmisa'
  , 'Marina	Meleleo', 'Daniela	Polchi', 'Angelo	Bottaro', 'Maria	Ferrara'
  , 'Antonello	Maiorano', 'Daniele	Falanga', 'Valentina	Griga', 'Valerio	Doddi'
  , 'Maria Giulia	Pagliaroli', 'Pietro	Olivieri', 'Maria Teresa	Inciocchi', 'Domenico Mauro	Conoscen'
  , 'Alex	Vriz', 'Giovani	Gabassi', 'Stefano	Pan', 'Mariella	Capomolla'
  , 'Stefania	Tiralongo', 'Anna	Di Pasquale', 'Mirella	Paoletti'
  , 'Genny	Ramundo', 'Carlos	Passoni', 'Sara	Garri'
  , 'Paola Nazzarena	Ferretti', 'Fosca Nota Fosca Arte	Manca', 'Gioacchino	Spera'
  , 'Giuseppe (noto) Pino	Congiu Manca', 'Alfredo	Ferri', 'Svetlana	Potoran', 'Mario	Fanuli'
  , 'Gianfranco	Serafin', 'Francesco	Startari', 'Zanfranco	Finocchio', 'Antonello	Maiorano'
  , 'Gabriella	Tolli', 'Andrea	Palermo', 'Elena	Cricenti', 'Umberto	Stefanini'
  , 'Il Mondo Della Cornice	Di Merchion', 'Paolo	Federico', 'Rosanna	Miccolis'
  , 'Francesca	Mosetti', 'Antonello	Maiorano', 'Giovanni Comodo	Gi.co.', 'Tiziana	Nicolai'
  , 'Nanda	Rago', 'Andrea	Petrucci', 'Antonello	Maiorano', 'Sery	Mastropietro'
  , 'Guerino	Casella', 'Giovani	Gabassi', 'Eltjon	Valle', 'Battistel	Giovanni'
  , 'Armando	De Matt', 'Renzo	Tonel', 'Giuseppina	Perugini'
  , 'Claudia	Piccoli', 'Eltjon	Valle', 'Massimiliano	De Sena', 'Carlo	Gatti'
  , 'Nadia	Guglielmo', 'Tamara	Pierbattisti', 'Antonino	Ferro'
  , 'Nanda	Rago', 'Anna	Di Pasquale', 'Alessandro	Golfi', 'Vincenzo	Valenziano', 'Michele	Galletta'
];


const allPossiblePlacesEntityLabels = [
  'Torino', 'Milano', 'Bari', 'Napoli', 'Roma', 'Arezzo', 'Toscana',
  'Pisa', 'Uffizi', 'Bologna', 'Lazio', 'Grosseto', 'Arezzo', 'Massa',
  'Ancona', 'Palermo', 'Genova', 'Firenze', 'Catania', 'Venezia', 'Verona', 'Messina',
  'Padova', 'Trieste', 'Taranto', 'Brescia', 'Parma', 'Prato', 'Modena', 'Reggio Calabria',
  'Reggio Emilia', 'Perugia', 'Ravenna', 'Livorno', 'Cagliari', 'Foggia', 'Rimini',
  'Salerno', 'Ferrara', 'Sassari', 'Latina', 'Giugliano in Campania', 'Monza', 'Siracusa',
  'Pescara', 'Bergamo', 'Forlì', 'Trento', 'Vicenza', 'Terni', 'Bolzano', 'Novara',
  'Piacenza', 'Ancona', 'Andria', 'Arezzo', 'Udine', 'Cesena', 'Lecce'
];


const allPossibleConceptsEntityLabels = [
  'Ombra', 'Happening', 'Luce', 'Contemporaneo', 'Liquido', 'Spazio', 'Tempo',
  'Gassoso', 'Amore', 'Odio', 'Astratto', 'Concreto', 'Materia', 'Sentimento', 'Vita',
  'Morte', 'Paura', 'Coraggio', 'Ansia', 'Pigment', 'Paint', 'Canvas', 'Panel',
  'Paper', 'Plaster', 'Linseed oil', 'Graphite', 'Charcoal', 'Pastels', 'Clay', 'Stone',
  'Watercolor', 'Tempera', 'Gouache', 'Casein paint', 'Ink', 'Light', 'Pencil', 'Wood',
  'Ivory', 'Ceramic', 'Stoneware', 'Metal', 'Plastic', 'Plexiglass', 'Fiberglass',
  'Glass', 'Wax', 'Fabric', 'Thread', 'Yarn', 'Film', 'Glaze', 'Pen', 'Crayon',
  'Vitreous enamel', 'Lacquer', 'Gelatin', 'Hide', 'Vellum and parchment', 'Glitter',
  'Art techniques', 'Aquatint', 'Cameraless photography', , 'Casting', 'Chromoxylography',
  'Cloisonné', 'Damascening', 'Drawing', 'Drypoint', 'Embroidery', 'Encaustic',
  'Engraving', 'Engraved gem', 'Etching', 'Filigree', 'Fresco', 'Gilding', 'Glassblowing',
  'Goldsmithing', 'Gouache', 'Linocut', 'Lithography',
  'Lost-wax casting', 'Mezzotint', 'Modeling', 'Monotype', 'Oil painting',
  , 'Intaglio printing', 'Planographic printing', 'Pottery', 'Printmaking', 'Relief',
  'Relief printing', 'Sculpture', 'Seriography', 'Stippling', 'Tapestry', 'Paper cutting',
  'Photography', 'Slipcasting', 'Watercolor', 'Weaving', 'Woodcut'
];
const allPossibleOrganizationsEntityLabels = [
  'Moma', 'Mac', 'Uffizi', 'Comune di Roma', 'Regione Lazio', 'Regione Toscana',
  'Comune di Pisa', 'Organization A', 'Istutito d\'arte', 'Istituzione Pisana',
  'Max', 'Mono', 'Comitato Arte Moderna', 'ModernArt', 'Wolf Systems', 'Raptor Systems',
  'Whiz Co.', 'Silver Linetworks', 'Grottolutions', 'Solsticetems', 'Tucanterprises',
  'Tigernite', 'Marswheels', 'Nimbleworks', 'Prodigy Brews', 'Zeus Foods', 'Smile Limited',
  'Wooductions', 'Equinetworks', 'Signetworks', 'Quaductions', 'Apexwood', 'Vortexbooks',
  'Oakcast', 'Neptune Security', 'Zeus Technologies', 'Apricot Networks', 'Aprico',
  'Shrubrews', 'Smilectronics', 'Neroductions', 'Websys', 'Tigerking', 'Alligatorshack',
  'Beedle', 'Crow Lighting', 'Grizzly Motors', 'Spiritechnologies', 'Marsecuriy',
  'Raptolutions', 'Electrorks', 'Pinkex', 'Marshstones', 'Thunderwalk'
];



function makeBasicEntity(typeOfEntity: any, label: string) {
  return {
    id: makeRandomBasicEntityId(),
    label,
    typeOfEntity
  };
}





let allRandomBasicEntities = [];

const peopleToe = getTypesOfEntity('toe-people');
allPossiblePeopleEntityLabels.forEach((label) => {
  allRandomBasicEntities.push(makeBasicEntity(peopleToe, label));
});


const placesToe = getTypesOfEntity('toe-places');
allPossiblePlacesEntityLabels.forEach((label) => {
  allRandomBasicEntities.push(makeBasicEntity(placesToe, label));
});

const conceptsToe = getTypesOfEntity('toe-concepts');
allPossibleConceptsEntityLabels.forEach((label) => {
  allRandomBasicEntities.push(makeBasicEntity(conceptsToe, label));
});

const oranizToe = getTypesOfEntity('toe-organizations');
allPossibleOrganizationsEntityLabels.forEach((label) => {
  allRandomBasicEntities.push(makeBasicEntity(oranizToe, label));
});



const allPossibleBreadcrumbs = [
  [
    { label: "Collezione d'arte" },
    { label: "Collezione 1" },
    { label: "..." },
  ],
  [
    { label: "Collezione d'arte" },
    { label: "Collezione 2" },
    { label: "..." },
  ],
  [
    { label: "Collezione d'arte" },
    { label: "Collezione Primaria" },
    { label: "..." },
  ],
  [
    { label: "Collezione d'arte" },
    { label: "NERVI Pier Luigi" },
  ],
  [
    { label: "Centro archivi" },
    { label: "Archivio Principale" },
    { label: "..." },
  ],
  [
    { label: "Centro archivi" },
    { label: "Archivio Secondario" },
    { label: "..." },
    { label: "..." },
  ],
  [
    { label: "Centro archivi" },
    { label: "Archivio Remoto" },
    { label: "..." },
  ],
];


const numOfAllItems = 500;

const allRandomBasicItems = [];
const allRandomItemDetails = {};

for (let i = 0; i < numOfAllItems; i++) {
  let metadataNumber = Math.trunc(Math.random() * 110) % 11
  let infos = []
  if (metadataNumber > 0) {
    let info = {
      value: Helpers.randomPick(allPossibleRandomItemAuthors)
    }
    if (Math.random() >= 0.33)
      info['key'] = 'author'
    infos.push(info)
    for (let j = 1; j < metadataNumber; j++) {
      let info = {
        value: Helpers.randomPick(allPossibleRandomItemShortDescription)
      }
      if (Math.random() >= 0.33)
        info['key'] = 'short_description'
      infos.push(info)
    }
  }
  let basicItem = {
    id: makeRandomItemId(),
    label: Helpers.randomPick(allPossibleRandomItemLabels),
    info: infos,
    icon: Helpers.randomPick(allPossibleRandomItemIcons)
  };
  allRandomBasicItems.push(basicItem);

  var width = Helpers.getRandomIntInclusive(900, 1800);
  var height = Helpers.getRandomIntInclusive(500, 800);

  let connectedEntities = [];
  const nBubbles = Helpers.getRandomIntInclusive(20, 50);
  const entitiesPick = pickNDistinctPositiveIntegers(allRandomBasicEntities.length, nBubbles)
  for (let j = 0; j < nBubbles; j++) {
    let eCdta = {
      entity: allRandomBasicEntities[entitiesPick[j]],
      count: Helpers.getRandomIntInclusive(1000, 5000)
    };
    connectedEntities.push(eCdta);
  }

  let breadcrumbs = [...Helpers.randomPick(allPossibleBreadcrumbs), { label: basicItem.label }];

  allRandomItemDetails[basicItem.id + ''] = {
    item: basicItem,
    title: basicItem.label,
    image: `https://placeimg.com/${width}/${height}/any`,
    text: Helpers.randomPick(allPossibleRandomItemTexts),
    fields: makeRandomFieldGroups(),
    connectedEntities,
    similarItems: null,
    breadcrumbs
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