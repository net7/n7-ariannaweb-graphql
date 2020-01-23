const { ApolloServer } = require('apollo-server');
const { importSchema } = require('graphql-import');
import  { resolvers } from './resolvers/mainResolvers';
import responseCachePlugin from 'apollo-server-plugin-response-cache';

var path = require ( 'path' );

const typeDefs = importSchema(path.join(__dirname, "schema.graphql"));

const server = new ApolloServer({
  typeDefs: typeDefs,
  resolvers,
  mocks: false,
  playground: true,
 /* plugins: [responseCachePlugin()],
  cacheControl: {
    defaultMaxAge: 3600,
  }*/
});

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});
