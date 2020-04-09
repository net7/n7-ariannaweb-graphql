import { createFields } from "./utils"

export const resolvers = {
	Node: {
		fields(node) {
			return createFields(node.fields)
    },
		document_type(node) {
      if (node.node_type != null && node.node_type == "oc"){
        return "oggetto-culturale"
      } else return "aggregazione-logica"
    },
		document_classification(node) {
			if (node.document_classification != null){
        return node.document_classification
      }
    }
	}
}

