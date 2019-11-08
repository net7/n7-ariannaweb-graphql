"use strict";
// For mockup reference see : https://projects.invisionapp.com/share/WGPPAPIE6N2
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
// import * as Mock_TypesOfEntity from './mock_typesOfEntity';
// import * as Mock_Entities from './mock_entities';
// import * as Mock_Items from './mock_items';
var Mock_Trees = __importStar(require("./mock_trees"));
// import * as Mock_Filters from './mock_filters';
// import * as Mock_Autocomplete from './mock_autocomplete';
// mock per le varie query
exports.mocks = {
    Query: function () { return ({
        // getAllTypesOfEntity: Mock_TypesOfEntity.getAllTypesOfEntity ,
        // getAllBasicItems: (_,args) => Mock_Items.getAllBasicItems(),// used only for testing the mocks, not to be included in resolvers
        // getItem: (_,args) => Mock_Items.getItem(args.itemId, args.maxSimilarItems),
        // getEntity: (_,args) => Mock_Entities.getEntity(args.entityId),
        getTreeOfItems: function (_parent, args, context, info) { return Mock_Trees.getTreeOfItems(args.treeId); },
    }); },
    Mutation: function () { return ({}); }
};
