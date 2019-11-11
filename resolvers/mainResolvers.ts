import { merge } from 'lodash'
import * as datasources from '../datasources/datasources'
import * as field from './Field'

const externalResolvers = [field].map(x => x.resolvers)

export const resolvers = merge({
	Query: {
		getItem: async (parent, args, context, info) => await datasources.getItem(args.itemId, args.maxSimilarItems, args.entitiesListSize),
		autoComplete: async (parent, args, context, info) => await datasources.getEntitiesFiltered(args.input, args.itemsPagination, args.typeOfEntity),
		globalFilter: async (parent, args, context, info) => await datasources.getItemsFiltered(args.selectedEntitiesIds, args.itemsPagination, args.entitiesListSize),
		getEntity: async (parent, args, context, info) => await datasources.getEntity(args.entityId, args.itemsPagination, args.entitiesListSize),
		getTreeOfItems: async (parent, args, context, info) => await datasources.getTree(),
		search: async (parent, args, context, info) => await datasources.search(args.searchParameters)
	},
}, ...externalResolvers)