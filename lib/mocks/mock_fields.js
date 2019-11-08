"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var Helpers = __importStar(require("./helpers"));
var allPossibleFieldKeys = [
    'Campo 123', 'Campo', 'Campo ABC', 'Campo speciale',
    'Campo standard', 'valore', 'info', 'nota'
];
var allPossibleFieldValues = [
    '99', 'Lorem ipsim', 'standard', 'normale', 'medio',
    'elevato', '...', 'attuale', 'vecchio'
];
function makeRandomFieldGroupId() {
    return Helpers.getRandomString(3) + "-fieldGroup-" + Helpers.getRandomString(3);
}
exports.makeRandomFieldGroupId = makeRandomFieldGroupId;
function makeRandomFieldId() {
    return Helpers.getRandomString(3) + "-field-" + Helpers.getRandomString(3);
}
exports.makeRandomFieldId = makeRandomFieldId;
function makeRandomFieldGroups() {
    var nOfGroups = Helpers.getRandomIntInclusive(0, 5);
    if (nOfGroups == 0)
        return null;
    var groups = [];
    for (var i = 0; i < nOfGroups; i++) {
        var group = {};
        group['id'] = makeRandomFieldGroupId();
        group['label'] = Helpers.randomPick(['Gruppo A', 'Gruppo 1', 'Gruppo Info', 'Gruppo Valori', "Gruppo Delta", "Gruppo Arte", "Gruppo xyz"]);
        group['fields'] = [];
        var nOfFields = Helpers.getRandomIntInclusive(1, 5);
        for (var j = 0; j < nOfFields; j++) {
            var field = {};
            field['id'] = makeRandomFieldId();
            field['key'] = Helpers.randomPick(allPossibleFieldKeys);
            field['value'] = Helpers.randomPick(allPossibleFieldValues);
            group['fields'].push(field);
        }
        groups.push(group);
    }
    return groups;
}
exports.makeRandomFieldGroups = makeRandomFieldGroups;
