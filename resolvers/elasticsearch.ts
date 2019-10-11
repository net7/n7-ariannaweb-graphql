import { Client } from '@elastic/elasticsearch'
import { elasticAuth as auth } from "./credentials"

const client = new Client({ node: 'https://95.216.97.241:9200', auth: auth, ssl: { rejectUnauthorized: false } })

export async function search(query) {
	const { body } = await client.search(query)
	const res = {
		total: body['hits']['total'],
		result: body['hits']['hits'].map(x => x['_source'])
	}
	return res;
}