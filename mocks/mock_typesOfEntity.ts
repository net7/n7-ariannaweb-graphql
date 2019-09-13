import * as Helpers from './helpers';


const allTypesOfEntity = [
 {
    id: 'typeofe-people',
    label: 'Persone',
    icon: 'n7-icon-biography',
    color: '#3a81f2'
 },
 {
    id: 'typeofe-places',
    label: 'Luoghi',
    icon: 'n7-icon-map1',
    color: '#f2cd3a'
  },
  {
    id: 'typeofe-concepts',
    label: 'Concetti',
    icon: 'n7-icon-lightbulb',
    color: '#5eab7b'
  },
  {
    id: 'typeofe-organizations',
    label: 'Organizzazioni',
    icon: 'n7-icon-building',
    color: '#c48731'
  }
];

export function getAllTypesOfEntity(){
  return allTypesOfEntity;
}