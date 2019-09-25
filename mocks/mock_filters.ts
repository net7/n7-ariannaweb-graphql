import * as Helpers from './helpers';

import { allRandomBasicItems } from './autogenerated_mock_elements';
import { getAllTypesOfEntity } from './mock_typesOfEntity';
import { makeRandomBasicEntity } from './mock_entities';
import { UserInputError } from 'apollo-server';
import { generateRandomBunchOfItemListings } from './mock_items';


let allPossibleThumbnails = [];
for(var i=30;i<150;i++) allPossibleThumbnails.push(`https://placeimg.com/${i}/${i}/any`);


export function getGlobalFilterResult( args:any ){
    let allTypesOfEntity = getAllTypesOfEntity();

    let typeOfEntityFiler = args.typeOfEntityFiler;
    if(!typeOfEntityFiler) {
        typeOfEntityFiler = [];
        allTypesOfEntity.forEach( (toe) => {
            typeOfEntityFiler.push( { typeOfEntityId: toe.id , enabled: true } );
        } );
    }

    let entitiesData = [];

    const reductionFactor = ( args.selectedEntitiesIds ? (args.selectedEntitiesIds.length+1) : 1 );

    for(var i=0;i<typeOfEntityFiler.length;i++){
        let toe = allTypesOfEntity.find( (toe) => toe.id === typeOfEntityFiler[i].typeOfEntityId );
        if(!toe){
            throw new UserInputError('Form Arguments invalid', {
                message: "No Type of entity present with id: '" + typeOfEntityFiler[i].typeOfEntityId + "'",
                invalidArgs: [typeOfEntityFiler] });
        } else {
            const typeOfEMinCount = Math.floor(20000/Math.pow(reductionFactor,2));
            const typeOfEMaxCount = Math.floor(50000/Math.pow(reductionFactor,2));
            let toeCount = Helpers.getRandomIntInclusive(typeOfEMinCount,typeOfEMaxCount);
            const countData = {
                type:toe,
                count: toeCount
            };
            let entitiesCountData = [];
            args.selectedEntitiesIds.forEach( (selId) => {
              if( ( toe.id === "toe-people" && selId.startsWith("pe_") ) ||
                  ( toe.id === "toe-places" && selId.startsWith("pl_") ) ||
                  ( toe.id === "toe-concepts" && selId.startsWith("cn_") ) ||
                  ( toe.id === "toe-organizations" && selId.startsWith("or_") ) ){
                      const typeOfEMinCount = Math.floor(toeCount/2.5);
                      const typeOfEMaxCount = Math.floor(toeCount/1.5);
                      let count = Helpers.getRandomIntInclusive(typeOfEMinCount,typeOfEMaxCount);
                      toeCount -= count;
                      let eCdta = {
                          entity: makeRandomBasicEntity(toe,selId),
                          count
                      };
                      entitiesCountData.push(eCdta);
              }
            });
            while(toeCount>0){
                let count = Helpers.getRandomIntInclusive(1000/reductionFactor,5000/reductionFactor);
                toeCount -= count;
                let eCdta = {
                    entity: makeRandomBasicEntity(toe),
                    count
                };
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
