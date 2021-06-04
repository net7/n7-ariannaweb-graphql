const { ApolloServer } = require('apollo-server');
const { importSchema } = require('graphql-import');
import  { resolvers } from './resolvers/mainResolvers';
import 'apollo-cache-control';
import responseCachePlugin from 'apollo-server-plugin-response-cache';
import {mocks} from "./mocks/mocks";
import { CollectionAPI } from './datasources/collectionDs';
import { SliderDs } from './datasources/slidesDs';
import * as config from './assets/app-config.json';
var path = require ( 'path' );

const typeDefs = importSchema(path.join(__dirname, "schema.graphql"));
const port = config['port'] || 4000
const server = new ApolloServer({
  typeDefs: typeDefs,
  resolvers,
  mocks: false,
  playground: true,
  plugins: [responseCachePlugin()],
  dataSources: () => {
    return {
      collectionAPI: new CollectionAPI(),
      sliderDs: new SliderDs()
    };
  }
  cacheControl: {
    defaultMaxAge: 604800,
  }
});

server.listen(port).then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});
