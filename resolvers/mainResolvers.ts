import { merge } from 'lodash'
import * as entity from './entity'

const externalResolvers = [entity].map(x => x.resolvers)

export const resolvers = merge({
	Query: {
		getEntity: async (parent, args, context, info) => await entity.getEntity(args.entityId)
	},
}, ...externalResolvers)