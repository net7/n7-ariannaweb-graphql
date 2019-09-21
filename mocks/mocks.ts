const { MockList } = require('graphql-tools');


// For mockup reference see : https://projects.invisionapp.com/share/WGPPAPIE6N2

import * as Helpers from './helpers';

import * as Mock_TypesOfEntity from './mock_typesOfEntity';

import * as Mock_Entities from './mock_entities';

import * as Mock_Items from './mock_items';

import * as Mock_Trees from './mock_trees';

import * as Mock_Filters from './mock_filters';

import * as Mock_Autocomplete from './mock_autocomplete';

// Inserire qui i mock per le varie query
export const mocks = {
  Query:() => ({
    getAllTypesOfEntity: Mock_TypesOfEntity.getAllTypesOfEntity ,
    getAllBasicItems: (_,args) => Mock_Items.getAllBasicItems(),// only for testing the mocks!
    getItemDetails: (_,args) => Mock_Items.getItemDetails(args.itemId),
    getEntityDetails: (_,args) => Mock_Entities.getEntityDetails(args.entityId),
    getTreeOfItems: (_,args) => Mock_Trees.getTreeOfItems(args.treeId),
    globalFilter: (_,args) => Mock_Filters.getGlobalFilterResult( args ),
    autoComplete: (_,args) => Mock_Autocomplete.autocomplete( args )
  }),
  Mutation: () => ({
  })
};
