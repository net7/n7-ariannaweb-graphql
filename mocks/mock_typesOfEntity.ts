const allTypesOfEntity = [
 {
    id: 'toe-people',
    label: 'Persone',
    icon: 'n7-icon-biography',
    color: '#3a81f2'
 },
 {
    id: 'toe-places',
    label: 'Luoghi',
    icon: 'n7-icon-map1',
    color: '#f2cd3a'
  },
  {
    id: 'toe-concepts',
    label: 'Concetti',
    icon: 'n7-icon-lightbulb',
    color: '#5eab7b'
  },
  {
    id: 'toe-organizations',
    label: 'Organizzazioni',
    icon: 'n7-icon-building',
    color: '#c48731'
  }
];

export function getAllTypesOfEntity(){
  return allTypesOfEntity;
}


export function getTypesOfEntity(typeOfEntityId:string){
  for(var i=0; i<allTypesOfEntity.length; i++){
    const toe = allTypesOfEntity[i];
    if(toe.id===typeOfEntityId) return toe;
  }
  return null;
}