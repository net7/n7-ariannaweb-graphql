import { merge } from 'lodash'
import * as datasources from '../datasources/datasources'
import * as entity from './entity'

const externalResolvers = [entity].map(x => x.resolvers)

export const resolvers = merge({
	Query: {
		getItem: async (parent, args, context, info) => await datasources.getItem(args.itemId, args.maxSimilarItems, args.entitiesListSize),
		autoComplete: async (parent, args, context, info) => await datasources.getEntitiesFiltered(args.input, args.itemsPagination, args.typeOfEntity),
		globalFilter: async (parent, args, context, info) => await datasources.getItemsFiltered(args.selectedEntitiesIds, args.itemsPagination, args.entitiesListSize),
		getEntity: async (parent, args, context, info) => await datasources.getEntity(args.entityId, args.itemsPagination, args.entitiesListSize)
	},
}, ...externalResolvers)