
export function createFields(object: any): any {
	let array = []
	for (const prop in object) {
		if (object.hasOwnProperty(prop)) {
			if (typeof object[prop] === 'string' || typeof object[prop] === 'boolean' )
				array.push({ key: prop, value: object[prop] })
			//else if (Array.isArray(object[prop])) {
      else if (typeof object[prop] == 'object' ) {
				let obj = { label: prop, fields: [] }
				//object[prop].forEach(el => {
        for (const el in object[prop]) {
				//object[prop].forEach(el => {
          if (typeof object[prop][el] !== 'object'){
          //	obj.fields.push(createFields({el}))
            obj.fields.push({key: el, value: object[prop][el]});
          }
					else
            obj.fields.push({ label: null, fields: createFields(object[prop][el]) })
        }
        //);
				array.push(obj)
			}
		}
	}
	return array
}

export function orderRelatedEntities(a, b){
	if ( a.entity.label < b.entity.label ){
	  return -1;
	}
	if ( a.entity.label > b.entity.label){
	  return 1;
	}
	return 0;
  }

export function orderDigitalObjects(a, b){
	if ( a.ordine < b.ordine ){
	  return -1;
	}
	if ( a.ordine > b.ordine){
	  return 1;
	}
	return 0;
  }