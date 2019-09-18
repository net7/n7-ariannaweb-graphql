import * as Helpers from './helpers';



const aWHomeConfig = [
        {
            id: "hero-first",
            configurations: [
                {
                    key: "title",
                    value: "Arte, Architettura, etc..."
                },
                {
                    key: "description",
                    value: "consulta il patrimonio, etc..."
                },
                {
                    key: "input",
                    value: "Cerca in MAXXI"
                },
                {
                    key: "button",
                    value: "Cerca"
                },
                {
                    key: "background-image",
                    value: "https://i.imgur.com/FgsxSYR.png"
                }
            ]
        },
        {
            id: "hero-second",
            configurations: [
                {
                    key: "title",
                    value: "Il MAXXI"
                },
                {
                    key: "description",
                    value: "La storia del MAXXI inizia nell'autunno del 1997 quando l'allora Ministero per i beni " +
                           "culturali ottiene dal Ministero della Difesa la cessione di un'ampia area nel quartiere, etc..."
                },
                {
                    key: "button",
                    value: "NAVIGA IL PATRIMONIO"
                },
                {
                    key: "background-image",
                    value: "https://www.solidbackgrounds.com/images/2560x1440/2560x1440-gray-solid-color-background.jpg"
                },
                {
                    key: "image",
                    value: "https://i.imgur.com/8BgHOBi.png"
                }
            ]
        },
        {
            id: "map",
            configurations: [
                {
                    key: "title",
                    value: "Le architetture del MAXXI nel mondo"
                },
                {
                    key: "description",
                    value: "La collezione del MAXXI contiene uno dei piu' vasti archivi di opera architettoniche al mondo." +
                           " Visita le opere sulla mappa."
                },
                {
                    key: "button",
                    value: "Vai alla mappa"
                }
            ]
        },
        {
            id: "gallery",
            configurations: [
                {
                    key: "title",
                    value: "La galleria delle opere"
                },
                {
                    key: "description",
                    value: "Visita la galleria delle opere esposte al MAXXI," +
                           " visualizza le immagini e accedi ai dati completi."
                },
                {
                    key: "button",
                    value: "Vai alla galleria"
                }
            ]
        },
];





export function getPageConfiguration(pageId: String){
  if(pageId==='aw-home'){
      return aWHomeConfig;
  }
  return null;
}
