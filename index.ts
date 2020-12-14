const { ApolloServer } = require('apollo-server');
const { importSchema } = require('graphql-import');
import  { resolvers } from './resolvers/mainResolvers';
import 'apollo-cache-control';
import responseCachePlugin from 'apollo-server-plugin-response-cache';
import {mocks} from "./mocks/mocks";
var path = require ( 'path' );

const typeDefs = importSchema(path.join(__dirname, "schema.graphql"));

const server = new ApolloServer({
  typeDefs: typeDefs,
  resolvers,
  mocks: false,
  playground: true,
  plugins: [responseCachePlugin()],
  cacheControl: {
    defaultMaxAge: 604800,
  }
});

server.listen({port: 4070}).then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});
