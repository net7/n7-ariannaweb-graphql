import { merge } from 'lodash'
import * as datasources from '../datasources/datasources'
import * as entity from './entity'

const externalResolvers = [entity].map(x => x.resolvers)

export const resolvers = merge({
	Query: {
		entitiesCountData: async () => await datasources.getEntitiesCountData(), 
		getEntity: async (parent, args, context, info) => await datasources.getEntity(args.entityId)
	},
}, ...externalResolvers)