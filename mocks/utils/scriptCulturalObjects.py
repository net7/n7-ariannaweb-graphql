import json as js

with open('source.json') as f:
   # strOfFile = f.read()
	array0 = js.load(f)
	with open('dest.njson', 'w') as dest:
		for key in array0:
			elem = array0[key]
			header = { "index" : { "_type" : "_doc", "_id" : elem['id'] } }
			connectedEntities = []
			for e1 in elem['connectedEntities']:
				if 'entity' in e1.keys():
					connectedEntities += [e1['entity']]
			elem['connectedEntities'] = connectedEntities
			dest.write(js.dumps(header) + '\n' + js.dumps(elem) + '\n')
print('terminato')
