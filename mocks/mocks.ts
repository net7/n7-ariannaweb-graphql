const { MockList } = require('graphql-tools');

import { Helpers } from './helpers';


// Inserire qui i mock per le varie query
export const mocks = {
  Query:() => ({
    getTestHero: (_,args) => { if(args.title) return { title:args.title };
                                else return {title: "default title"}; }
  }),
  Mutation: () => ({
  })
};
