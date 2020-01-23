/**
 * Link showing tree linearization and tree building
 * https://www.geeksforgeeks.org/serialize-deserialize-n-ary-tree/
 */
var treeLine = [{ label: 'ciao', level: 0, position: 0 }, { label: 'sono', level: 1, position: 1 }, { label: 'Nino', level: 2, position: 2 },
    { label: 'antipatico', level: 2, position: 3 }, { label: 'bello', level: 2, position: 4 }, { label: 'piacere', level: 1, position: 5 },
    { label: 'di', level: 2, position: 6 }, { label: 'conoscerti', level: 3, position: 7 }, { label: 'come', level: 1, position: 8 },
    { label: 'ti', level: 2, position: 9 }, { label: 'chiami', level: 3, position: 10 }, { label: 'stai', level: 2, position: 11 }];
var root = treeLine.shift();
function buildTree(node, nodeList) {
    node['children'] = [];
    while (nodeList.length > 0 && nodeList[0].level > node.level) {
        node.children.push(buildTree(nodeList.shift(), nodeList));
    }
    return node;
}
function serializeTree(node, nodeList, level) {
    var children = node.children;
    delete node.children;
    node['level'] = level;
    nodeList.push(node);
    for (var _i = 0, children_1 = children; _i < children_1.length; _i++) {
        var node0 = children_1[_i];
        serializeTree(node0, nodeList, level + 1);
    }
    return nodeList;
}
var util = require('util');
var tree = buildTree(root, treeLine);
console.log(util.inspect(tree, false, null, true /* enable colors */));
var nodeList = serializeTree(tree, [], 0);
console.log(util.inspect(nodeList, false, null, true /* enable colors */));
