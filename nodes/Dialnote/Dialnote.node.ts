import { NodeConnectionTypes, type INodeType, type INodeTypeDescription } from 'n8n-workflow';

/**
 * dialnote actions node (declarative). Resources and operations are added per
 * resource under ./resources; this shell carries the credential and request
 * defaults every operation shares.
 */
export class Dialnote implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'dialnote',
		name: 'dialnote',
		icon: { light: 'file:dialnote.svg', dark: 'file:dialnote.dark.svg' },
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Work with dialnote contacts, messages, notes, calls and conversations',
		defaults: {
			name: 'dialnote',
		},
		usableAsTool: true,
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [
			{
				name: 'dialnoteApi',
				required: true,
			},
		],
		requestDefaults: {
			baseURL: 'https://api.dialnote.com/api/v1/public',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
		},
		properties: [],
	};
}
