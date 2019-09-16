const { MockList } = require('graphql-tools');


// For mockup reference see : https://projects.invisionapp.com/share/WGPPAPIE6N2

import * as Helpers from './helpers';

import * as Mock_TypesOfEntity from './mock_typesOfEntity';

import * as Mock_Entities from './mock_entities';

import * as Mock_Items from './mock_items';

import * as Mock_Trees from './mock_trees';

// Inserire qui i mock per le varie query
export const mocks = {
  Query:() => ({
    /////////////// TO REMOVE /////////////////////////////////////////////
    getTestHero: (_,args) => { if(args.title) return { title:args.title };
                                else return {title: "default title"}; },
    ///////////////////////////////////////////////////////////////////////
    getAllTypesOfEntity: Mock_TypesOfEntity.getAllTypesOfEntity ,
    getAllBasicItems: (_,args) => Mock_Items.getAllBasicItems(),// only for testing the mocks!
    getItemDetails: (_,args) => Mock_Items.getItemDetails(args.itemId),
    getTreeOfItems: (_,args) => Mock_Trees.getTreeOfItems(args.treeId)
  }),
  Mutation: () => ({
  })
};
