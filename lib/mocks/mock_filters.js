"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var Helpers = __importStar(require("./helpers"));
var mock_typesOfEntity_1 = require("./mock_typesOfEntity");
var apollo_server_1 = require("apollo-server");
var mock_items_1 = require("./mock_items");
var mock_entities_1 = require("./mock_entities");
var allPossibleThumbnails = [];
for (var i = 30; i < 150; i++)
    allPossibleThumbnails.push("https://placeimg.com/" + i + "/" + i + "/any");
function getGlobalFilterResult(args) {
    var allTypesOfEntity = mock_typesOfEntity_1.getAllTypesOfEntity();
    var typeOfEntityFiler = args.typeOfEntityFiler;
    if (!typeOfEntityFiler) {
        typeOfEntityFiler = [];
        allTypesOfEntity.forEach(function (toe) {
            typeOfEntityFiler.push({ typeOfEntityId: toe, enabled: true });
        });
    }
    var entitiesData = [];
    var reductionFactor = (args.selectedEntitiesIds ? (args.selectedEntitiesIds.length + 1) : 1);
    var selectedBubblesMinCount = -1;
    var selectedBubblesMaxCount = 0;
    var toeCounts = [];
    var selectedEntitiesIdsCounts = {};
    var _loop_1 = function (i_1) {
        var typeOfEMinCount = Math.floor(40000 / Math.pow(reductionFactor, 2));
        var typeOfEMaxCount = Math.floor(100000 / Math.pow(reductionFactor, 2));
        toeCounts[i_1] = Helpers.getRandomIntInclusive(typeOfEMinCount, typeOfEMaxCount);
        var toe = allTypesOfEntity.find(function (toe) { return toe === typeOfEntityFiler[i_1].typeOfEntityId; });
        if (args.selectedEntitiesIds)
            args.selectedEntitiesIds.forEach(function (selId) {
                var bEntity = mock_entities_1.getBasicEntityById(selId);
                if (bEntity && (bEntity.typeOfEntity === toe)) {
                    var selElementMinCount = Math.floor(toeCounts[i_1] / 2.1);
                    var selElementMaxCount = Math.floor(toeCounts[i_1] / 2.05);
                    var count = Helpers.getRandomIntInclusive(selElementMinCount, selElementMaxCount);
                    if (count > selectedBubblesMaxCount)
                        selectedBubblesMaxCount = count;
                    if (selectedBubblesMinCount === -1 || count < selectedBubblesMinCount)
                        selectedBubblesMinCount = count;
                    selectedEntitiesIdsCounts[selId] = count;
                }
            });
    };
    for (var i_1 = 0; i_1 < typeOfEntityFiler.length; i_1++) {
        _loop_1(i_1);
    }
    ;
    var _loop_2 = function (i_2) {
        var toeCount = toeCounts[i_2];
        var toe = allTypesOfEntity.find(function (toe) { return toe === typeOfEntityFiler[i_2].typeOfEntityId; });
        if (!toe) {
            throw new apollo_server_1.UserInputError('Form Arguments invalid', {
                message: "No Type of entity present with id: '" + typeOfEntityFiler[i_2].typeOfEntityId + "'",
                invalidArgs: [typeOfEntityFiler]
            });
        }
        else {
            var countData = {
                type: toe,
                count: toeCount
            };
            var entitiesCountData_1 = [];
            if (args.selectedEntitiesIds)
                args.selectedEntitiesIds.forEach(function (selId) {
                    var bEntity = mock_entities_1.getBasicEntityById(selId);
                    if (bEntity && (bEntity.typeOfEntity === toe)) {
                        var count = selectedEntitiesIdsCounts[selId];
                        toeCount -= (count / 2.5);
                        var eCdta = {
                            entity: bEntity,
                            count: count
                        };
                        entitiesCountData_1.push(eCdta);
                    }
                });
            var elementMinCount = Math.floor(toeCount / 9);
            var elementMaxCount = (selectedBubblesMinCount > 0 ? Math.floor(selectedBubblesMinCount * 0.85) : Math.floor(toeCount / 2.3));
            while (toeCount > 0) {
                var count = Helpers.getRandomIntInclusive(elementMinCount, elementMaxCount);
                toeCount -= (count / 2.5);
                var eCdta = {
                    entity: mock_entities_1.getRandomBasicEntityFromType(toe),
                    count: count
                };
                var alreadyPresent = false;
                for (var j = 0; j < entitiesCountData_1.length; j++) {
                    if (entitiesCountData_1[j].entity.id === eCdta.entity.id) {
                        alreadyPresent = true;
                        break;
                    }
                }
                if (!alreadyPresent)
                    entitiesCountData_1.push(eCdta);
            }
            entitiesData.push({
                countData: countData,
                entitiesCountData: entitiesCountData_1
            });
        }
    };
    for (var i_2 = 0; i_2 < typeOfEntityFiler.length; i_2++) {
        _loop_2(i_2);
    }
    var itemsPagination = null;
    if (args.selectedEntitiesIds && args.selectedEntitiesIds.length > 0) {
        var numOfItems = 5 * Math.floor(Helpers.getRandomIntInclusive(900, 2000) / (Math.pow(args.selectedEntitiesIds.length, 3)));
        if (!args.itemsPagination) {
            itemsPagination = {
                totalCount: numOfItems,
                items: mock_items_1.generateRandomBunchOfItemListings(allPossibleThumbnails, numOfItems)
            };
        }
        else {
            itemsPagination = {
                totalCount: numOfItems,
                items: mock_items_1.generateRandomBunchOfItemListings(allPossibleThumbnails, args.itemsPagination.limit)
            };
        }
    }
    return {
        entitiesData: entitiesData,
        itemsPagination: itemsPagination
    };
}
exports.getGlobalFilterResult = getGlobalFilterResult;
