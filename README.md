# Arianna-Web Apollo Server

Project created using node v10.16.


## Installation

To install the software and its dependecies :

```bash
npm install
```

## Execution

To locally run the server :

```bash
npm start
```

Once started go to http://localhost:4000/ to access Apollo's playground in which you can see the Schemas autogeneratet docs and where you can test the various queries.

## Development

If you're editing the source files you can run the server in "development" mode with :

```bash
npm run develop
```

In this mode the Apollo server will be restarted each time one of the aformentioned files is modified allowing you to test the change immediately (this feature includes the typescript files and also the scherma.graphql file containing the graphQL schema for the server).



## Zeit Integration

This (github) repository has been set with Zeit.co integration system, meaning that pushing (or merging) onto the repository updates the Zeit project deployment (which can be used as temporary deploy during development).

Pushing (or merging) to the *master* branch updates the project present at: 
 https://n7-ariannaweb-graphql.net7.now.sh

 *(Note: to change the Zeit project's settings and integration access Zeit.co using the official **Net7** github account)*
