import { createFields } from "./utils"

export const resolvers = {
	Node: {
		fields(node) {
			return createFields(node.fields)
    },
		document_type(node) {
      if (node.fields.node_type != null && node.fields.node_type  == "oc"){
        return "oggetto-culturale"
      } else return "aggregazione-logica"
    },
		document_classification(node) {
			if (node.fields.document_classification != null){
        return node.fields.document_classification
      }
    }
	}
}

