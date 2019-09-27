const allTypesOfEntity = [
 {
    id: 'toe-people',
    label: 'Persone',
    configKey: 'people'
 },
 {
    id: 'toe-places',
    label: 'Luoghi',
    configKey: 'places'
  },
  {
    id: 'toe-concepts',
    label: 'Concetti',
    configKey: 'concepts'
  },
  {
    id: 'toe-organizations',
    label: 'Organizzazioni',
    configKey: 'organizations'
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