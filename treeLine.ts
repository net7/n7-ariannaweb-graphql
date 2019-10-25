/**
 * Link showing tree linearization and tree building
 * https://www.geeksforgeeks.org/serialize-deserialize-n-ary-tree/
 */

const treeLine = [{ label: 'ciao', level: 0, position: 0 }, { label: 'sono', level: 1, position: 1 }, { label: 'Nino', level: 2, position: 2 },
{ label: 'antipatico', level: 2, position: 3 }, { label: 'bello', level: 2, position: 4 }, { label: 'piacere', level: 1, position: 5 },
{ label: 'di', level: 2, position: 6 }, { label: 'conoscerti', level: 3, position: 7 }, { label: 'come', level: 1, position: 8 },
{ label: 'ti', level: 2, position: 9 }, { label: 'chiami', level: 3, position: 10 }, { label: 'stai', level: 2, position: 11 }]

const root = treeLine.shift()

function buildTree(node: any, nodeList: any[]): any {
	node['children'] = []
	while (nodeList.length > 0 && nodeList[0].level > node.level) {
		node.children.push(buildTree(nodeList.shift(), nodeList))
	}
	return node
}

function serializeTree(node: any, nodeList: any[], level: number): any {
	const children = node.children
	delete node.children
	node['level'] = level
	nodeList.push(node)
	for (let node0 of children) {
		serializeTree(node0, nodeList, level + 1)
	}
	return nodeList
}

const util = require('util'
)
const tree = buildTree(root, treeLine)

console.log(util.inspect(tree, false, null, true /* enable colors */))

const nodeList = serializeTree(tree, [], 0)

console.log(util.inspect(nodeList, false, null, true /* enable colors */))
