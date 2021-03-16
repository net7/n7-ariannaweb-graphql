const { RESTDataSource } = require('apollo-datasource-rest');
import * as config from '../assets/app-config.json';

class Page {
    offset: number
    limit: number
}

/*export async function getCollections( collectionPagination: Page = { limit: 10000, offset: 0 }){
    
}*/

export class CollectionAPI extends RESTDataSource {
    constructor() {
        super();
        this.baseURL = config.collectionAddress;
      }

    async getCollection(id: number, page: Page) {
        const {limit, offset} = page;
        const collection =  await this.get(`collections/${id}?limit=${limit}&offset=${offset}`);
        return collection;
    }

    async getCollections(page: Page = { limit: -1, offset: 0 }) {
        const {limit, offset} = page;
        const collection =  await this.get(`collections?limit=${limit}&offset=${offset}`);
        return collection;
    }

}


