const { ApolloServer } = require('apollo-server');
const { importSchema } = require('graphql-import');
import  { resolvers } from './resolvers/mainResolvers';

const typeDefs = importSchema('./schema.graphql');

//import { mocks } from './mocks/mocks';

const server = new ApolloServer({
  typeDefs: typeDefs,
  resolvers,
  //mockEntireSchema: false,
  //mocks: mocks,
  playground: true, // playgound to work on zeit.co should anyway be removed before production
});

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});
