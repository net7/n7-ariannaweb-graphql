"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolvers = {
    Field: {
        __resolveType: function (field, context, info) {
            if (field.fields) {
                return 'KeyValueFieldGroup';
            }
            if (field.key) {
                return 'KeyValueField';
            }
            return null;
        }
    }
};
