import { orderDigitalObjects } from "./utils"


export const resolvers = {
	DigitalObject: {
		items(node, args, context, info){
			if(node.images){
				return node.images.map( i => {
						i.type = node.doType;
						return i; } 
				).sort(orderDigitalObjects);
			}
		},
		url(node) {
			if( node.externalViewerUrl && node.externalViewerUrl != "" ){
				return node.externalViewerUrl;
			}
		},
		type(node) {
			if( node.doType && node.doType == "jpg-png" ){
				return "images-simple"
			} else if( node.doType && node.doType != "" ){
				return node.doType
			} else if( node.externalViewerUrl && node.externalViewerUrl != "" ){
				return "external";
			}
		},
		label(node) {
			return node.titolo
		},
		order(node) {
			return node.ordine
		}
	},
	BinaryItem: {
		label(node) {
			return node.titolo
		},
		order(node) {
			return node.ordine
		}
	}
}

