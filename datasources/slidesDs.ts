const { RESTDataSource } = require('apollo-datasource-rest');
import * as config from '../assets/app-config.json';

export class SliderDs extends RESTDataSource {
    constructor() {
        super();
        this.baseURL = config['sliderAPIUrl'] ?? "";
      }

    async getSlider() {
        const slides =  await this.get(`slides`);       
        return slides;
    }
}


