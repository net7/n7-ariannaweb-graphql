const { RESTDataSource } = require('apollo-datasource-rest');

class ParametersAPI extends RESTDataSource {
  constructor() {
    super();
  }

    async getParameters(section, paramName, startDate, endDate) {

    }


}

module.exports = ParametersAPI;
