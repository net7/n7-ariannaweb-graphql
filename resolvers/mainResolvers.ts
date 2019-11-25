import { merge } from 'lodash'
import * as sources from '../datasources/datasources'
import * as field from './Field'
import * as item from './Item'
import * as entity from './Entity'
import * as node from './Node'
import * as genericNode from './GenericNode'
import * as result from './Result'

const externalResolvers = [field, item, entity, node, genericNode, result].map(x => x.resolvers)

export const resolvers = merge({
	Query: {
		getItem: async (parent, args, context, info) => await sources.getItem(args.itemId, args.maxSimilarItems, args.entitiesListSize),
		autoComplete: async (parent, args, context, info) => await sources.getEntitiesFiltered(args.input, args.itemsPagination, args.typeOfEntity),
		globalFilter: async (parent, args, context, info) => await sources.getItemsFiltered(args.selectedEntitiesIds, args.itemsPagination, args.entitiesListSize),
		getEntity: async (parent, args, context, info) => await sources.getEntity(args.entityId, args.itemsPagination, args.entitiesListSize),
		getTreeOfItems: async (parent, args, context, info) => await sources.getTree(),
		getNode: async (parent, args, context, info) => await sources.getNode(args.id, args.maxSimilarItems, args.entitiesListSize),
		search: async (parent, args, context, info) => await sources.search(args.searchParameters)
	},
}, ...externalResolvers)