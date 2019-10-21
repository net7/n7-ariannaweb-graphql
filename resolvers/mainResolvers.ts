import { merge } from 'lodash'
import * as datasources from '../datasources/datasources'
import * as entity from './entity'

const externalResolvers = [entity].map(x => x.resolvers)

export const resolvers = merge({
	Query: {
		globalFilter: async (parent, args, context, info) => await datasources.getItemsFiltered(args.selectedEntitiesIds, args.itemsPagination),
		getEntity: async (parent, args, context, info) => await datasources.getEntity(args.entityId)
	},
}, ...externalResolvers)