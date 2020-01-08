const { ApolloServer } = require('apollo-server');
const { importSchema } = require('graphql-import');
import  { resolvers } from './resolvers/mainResolvers';

var path = require ( 'path' );

const typeDefs = importSchema(path.join(__dirname, "schema.graphql"));

const server = new ApolloServer({
  typeDefs: typeDefs,
  resolvers,
  mocks: false,
  playground: true, // playgound to work on zeit.co should anyway be removed before production
});

server.listen({port: 4070}).then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});
