import * as Helpers from './helpers';
import { generateRandomBunchOfItemListings } from './mock_items';


export function makeRandomTreeId():String{
  return Helpers.getRandomString(3)+"-tree-"+Helpers.getRandomString(3);
}


function treeBranch(label:string){
    this.id=makeRandomTreeId();
    this.label=label;
    this.icon=null;
    this.img=null;
    this.branches=makeBunchOfTreeLeaves();
}

const allPossibleLeavesIcons = [
    "n7-icon-archive",
    "n7-icon-atlas",
    "n7-icon-books",
    "n7-icon-camera",
    "n7-icon-earth",
    "n7-icon-file3",
    "n7-icon-illustration"
  ];


function makeBunchOfTreeLeaves(){
  let treeBranches = [];
  const tmpItemListings = generateRandomBunchOfItemListings(allPossibleLeavesIcons);
  tmpItemListings.forEach( it => {
    treeBranches.push({
      id: it.item.id,
      icon: it.thumbnail,
      img: it.img,
      label: it.item.label,
      branches: null
    });
  });

  return treeBranches;
}


export function getTreeOfItems(treeId:String){
    let centroArchiviBranches = [];

    [ '5+1AA Agenzia di Architettura', 'ABDR Architetti Associati', 'AWP', 
    'BOERI Cini', 'Campo BAEZA Alberto', 'CASSANI Matilde', 'Guerri Danilo',
    'ISOLA Aimaro' ].forEach( (lbl) => centroArchiviBranches.push( new treeBranch(lbl) ) );
    let nerviPierLuigi = new treeBranch('NERVI Pier Luigi');
    nerviPierLuigi.branches = [];
    [ 'Attività Professionale', 'Materiali fotografici e audio-video', 'Corrispondenza', 'Ricerca e didattica',
     'Materiali e stampa', 'Documenti d\'impresa', 'Biblioteca aggregta'
    ].forEach( (lbl) => nerviPierLuigi.branches.push( new treeBranch(lbl) ) );
    centroArchiviBranches.push( nerviPierLuigi );
    [ 'OBR Open Building Research', 'PANICONI Mario - PEDICONI Giulio', 'PERUGINI Giuseppe',
    'PETRESCHI Marco', 'PIANO Renzo', 'PIERLUISI Franco', 'RIVA Umberto', 'ROTA Italo',
    'SIZA Alvaro', 'SUPERSTUDIO' ].forEach( (lbl) => centroArchiviBranches.push( new treeBranch(lbl) ) );

    // add in this switch statement new cases for eventual new trees
    switch(treeId){
      case 'patrimonioId':
        return {
          id: "patri_tree",
          icon: "n7-icon-archive",
          img: null,
          label: "Albero di navigazione",
          branches: [
              {
                id: "coll_art",
                label: "Collezione D'arte",
                icon: null,
                img: null,
                branches: makeBunchOfTreeLeaves()
              },
              {
                id: "cntr_arch",
                label: "Centro Archivi",
                icon: null,
                img: null,
                branches: centroArchiviBranches
              },
          ]
        };
      default:
        return null;
    }
}

