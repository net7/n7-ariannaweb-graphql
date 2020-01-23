import * as Helpers from './helpers';

import { getAllTypesOfEntity } from './mock_typesOfEntity';
import { UserInputError } from 'apollo-server';
import { generateRandomBunchOfItemListings } from './mock_items';
import { getRandomBasicEntityFromType, getBasicEntityById } from './mock_entities';


let allPossibleThumbnails = [];
for(var i=30;i<150;i++) allPossibleThumbnails.push(`https://placeimg.com/${i}/${i}/any`);


export function getGlobalFilterResult( args:any ){
    let allTypesOfEntity = getAllTypesOfEntity();

    let typeOfEntityFiler = args.typeOfEntityFiler;
    if(!typeOfEntityFiler) {
        typeOfEntityFiler = [];
        allTypesOfEntity.forEach( (toe) => {
            typeOfEntityFiler.push( { typeOfEntityId: toe , enabled: true } );
        } );
    }

    let entitiesData = [];

    const reductionFactor = ( args.selectedEntitiesIds ? (args.selectedEntitiesIds.length+1) : 1 );

    let selectedBubblesMinCount = -1;
    let selectedBubblesMaxCount = 0;

    let toeCounts:number[] = [];
    let selectedEntitiesIdsCounts: any = {};
    for(let i=0;i<typeOfEntityFiler.length;i++){
      const typeOfEMinCount = Math.floor(40000/Math.pow(reductionFactor,2));
      const typeOfEMaxCount = Math.floor(100000/Math.pow(reductionFactor,2));
      toeCounts[i] = Helpers.getRandomIntInclusive(typeOfEMinCount,typeOfEMaxCount);
      let toe = allTypesOfEntity.find( (toe) => toe === typeOfEntityFiler[i].typeOfEntityId );
      if(args.selectedEntitiesIds)
      args.selectedEntitiesIds.forEach( (selId) => {
        let bEntity = getBasicEntityById(selId);
        if( bEntity && (bEntity.typeOfEntity === toe) ){
          const selElementMinCount = Math.floor(toeCounts[i]/2.1);
          const selElementMaxCount = Math.floor(toeCounts[i]/2.05);
          let count = Helpers.getRandomIntInclusive(selElementMinCount,selElementMaxCount);
          if(count>selectedBubblesMaxCount) selectedBubblesMaxCount=count;
          if(selectedBubblesMinCount===-1 || count<selectedBubblesMinCount) selectedBubblesMinCount=count;
          selectedEntitiesIdsCounts[selId] = count;
        }
      });
    };


    for(let i=0;i<typeOfEntityFiler.length;i++){
        let toeCount:number = toeCounts[i];
        let toe = allTypesOfEntity.find( (toe) => toe === typeOfEntityFiler[i].typeOfEntityId );
        if(!toe){
            throw new UserInputError('Form Arguments invalid', {
                message: "No Type of entity present with id: '" + typeOfEntityFiler[i].typeOfEntityId + "'",
                invalidArgs: [typeOfEntityFiler] });
        } else {
            const countData = {
                type:toe,
                count: toeCount
            };
            let entitiesCountData = [];
            if(args.selectedEntitiesIds)
              args.selectedEntitiesIds.forEach( (selId) => {
                let bEntity = getBasicEntityById(selId);
                if( bEntity && (bEntity.typeOfEntity === toe) ){
                  let count = selectedEntitiesIdsCounts[selId];
                  toeCount -= (count/2.5);
                  let eCdta = {
                      entity: bEntity,
                      count
                  };
                  entitiesCountData.push(eCdta);
                }
              });
            const elementMinCount = Math.floor(toeCount/9);
            const elementMaxCount = (selectedBubblesMinCount>0 ? Math.floor(selectedBubblesMinCount*0.85) : Math.floor(toeCount/2.3) );
            while(toeCount>0){
                let count = Helpers.getRandomIntInclusive(elementMinCount,elementMaxCount);
                toeCount -= (count/2.5);
                let eCdta = {
                    entity: getRandomBasicEntityFromType(toe),
                    count
                };
                let alreadyPresent = false;
                for(let j=0;j<entitiesCountData.length;j++){
                  if(entitiesCountData[j].entity.id===eCdta.entity.id){
                    alreadyPresent = true;
                    break;
                  }
                }
                if(!alreadyPresent)
                  entitiesCountData.push(eCdta);
            }
            entitiesData.push({
                countData,
                entitiesCountData
            });
        }
    }

    let itemsPagination = null;
    if(args.selectedEntitiesIds && args.selectedEntitiesIds.length>0){
        let numOfItems = 5*Math.floor(Helpers.getRandomIntInclusive(900,2000)/(Math.pow(args.selectedEntitiesIds.length,3)));
        if(!args.itemsPagination){
          itemsPagination = {
            totalCount: numOfItems,
            items: generateRandomBunchOfItemListings(allPossibleThumbnails,numOfItems)
          }
        } else {
          itemsPagination = {
            totalCount: numOfItems,
            items: generateRandomBunchOfItemListings(allPossibleThumbnails,args.itemsPagination.limit)
          }
        }
    }
    return {
        entitiesData,
        itemsPagination
    };
}
