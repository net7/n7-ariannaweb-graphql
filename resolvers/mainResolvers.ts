import { merge } from 'lodash'
import * as datasources from '../datasources/datasources'
import * as entity from './entity'

const externalResolvers = [entity].map(x => x.resolvers)

export const resolvers = merge({
	Query: {
		autoComplete: async (parent, args, context, info) => await datasources.autocomplete(args.input, args.itemsPagination, args.typeOfConfigKey),
		globalFilter: async (parent, args, context, info) => await datasources.getItemsFiltered(args.selectedEntitiesIds, args.itemsPagination, args.entitiesListSize),
		getEntity: async (parent, args, context, info) => await datasources.getEntity(args.entityId)
	},
}, ...externalResolvers)