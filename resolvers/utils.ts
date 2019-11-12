
export function createFields(object: any): any {
	let array = []
	for (const prop in object) {
		if (object.hasOwnProperty(prop)) {
			if (typeof object[prop] === 'string')
				array.push({ key: prop, value: object[prop] })
			else if (Array.isArray(object[prop])) {
				let obj = { label: prop, fields: [] }
				object[prop].forEach(el => {
					if (typeof el === 'string')
						obj.fields.push(createFields(el))
					else
						obj.fields.push({ label: null, fields: createFields(el) })
				});
				array.push(obj)
			}
		}
	}
	return array
}