import json as js

with open('source.json') as f:
   # strOfFile = f.read()
	array0 = js.load(f)["getAllEntities"]
	with open('dest.njson', 'w') as dest:
		for elem in array0:
			header = { "index" : { "_type" : "_doc", "_id" : elem['id'] } }
			list0 = []
			for e1 in elem['entities']:
				if 'entity' in e1.keys():
					list0 += [e1['entity']]
			elem['entities'] = list0
			list = []
			for e1 in elem['items']:
				if 'item' in e1.keys():
					list0 += [e1['item']]
			dest.write(js.dumps(header) + '\n' + js.dumps(elem) + '\n')
print('terminato')
