"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ApolloServer = require('apollo-server').ApolloServer;
var importSchema = require('graphql-import').importSchema;
var mainResolvers_1 = require("./resolvers/mainResolvers");
var path = require('path');
var typeDefs = importSchema(path.join(__dirname, "schema.graphql"));
var mocks_1 = require("./mocks/mocks");
var server = new ApolloServer({
    typeDefs: typeDefs,
    resolvers: mainResolvers_1.resolvers,
    mockEntireSchema: false,
    mocks: mocks_1.mocks,
    playground: true,
});
server.listen().then(function (_a) {
    var url = _a.url;
    console.log("\uD83D\uDE80 Server ready at " + url);
});
