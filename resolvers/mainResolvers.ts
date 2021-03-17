import { merge } from 'lodash'
import * as sources from '../datasources/datasources'
import * as field from './Field'
import * as item from './Item'
import * as entity from './Entity'
import * as node from './Node'
import * as genericNode from './GenericNode'
import * as globalFilterData from './GlobalFilterData'
import * as mapObject from './MapObject'
import * as eventObject from './EventObject'
import * as result from './Result'
import * as digitalObject from './DigitalObject'
import * as collection from './Collection'
import * as collectionItem from './CollectionItem'

const externalResolvers = [field, item, entity, node, genericNode, globalFilterData, result, mapObject, eventObject, digitalObject, collection, collectionItem].map(x => x.resolvers)
export const resolvers = merge({
	Query: {
		getItem: async (parent, args, context, info) => await sources.getItem(args.itemId, args.maxSimilarItems, args.entitiesListSize),
		autoComplete: async (parent, args, context, info) => await sources.getEntitiesFiltered(args.input, args.itemsPagination, args.typeOfEntity),
		globalFilter: async (parent, args, context, info) => await sources.getItemsFiltered(args.selectedEntitiesIds, args.itemsPagination, args.entitiesListSize),
		getEntity: async (parent, args, context, info) => await sources.getEntity(args.entityId, args.itemsPagination, args.entitiesListSize),
		getTreeOfItems: async (parent, args, context, info) => await sources.getTree(info),
		getNode: async (parent, args, context, info) => await sources.getNode(args.id, args.maxSimilarItems, args.entitiesListSize),
		search: async (parent, args, context, info) => await sources.search(args.searchParameters),
		getMapObjects: async (parent, args, context, info) => await sources.getMapObjects(args.field),
		getEventObjects: async (parent, args, context, info) => await sources.getEventObjects(args.field),
		getResourceById: async (parent, args, context, info) => await sources.getResourceById(args.id),
		getCollections: async (parent, args, { dataSources }, info) => await dataSources.collectionAPI.getCollections(args.collectionPagination),
		getCollection: async (parent, args, { dataSources }, info) => await dataSources.collectionAPI.getCollection(args.id, args.itemPagination)
	},
}, ...externalResolvers)