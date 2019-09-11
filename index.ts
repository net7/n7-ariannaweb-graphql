const { ApolloServer, gql } = require('apollo-server');
const resolvers = require('./resolvers');
const ParametersAPI = require('./datasources/parameters');

var fs = require ( 'fs' );
var path = require ( 'path' );

const typeDefs = fs.readFileSync(path.join(__dirname, "schema.graphql"), "utf8");

import { mocks } from './mocks/mocks';

const server = new ApolloServer({
  typeDefs,
  mocks,
  mockEntireSchema: true,
  resolvers,
  playground: true, // playgound set to true allows the playground to work on zeit.co should anyway be removed before production
  dataSources: () => ({
    ParametersAPI: new ParametersAPI()
})
});

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});

//module.exports = server.createHandler ();
