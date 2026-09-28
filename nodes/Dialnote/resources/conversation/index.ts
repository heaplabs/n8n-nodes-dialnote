import type { INodeProperties } from 'n8n-workflow';
import { idPath, limitField, unwrap } from '../shared';

const show = { resource: ['conversation'] };

export const conversationDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show },
		options: [
			{
				name: 'Get',
				value: 'get',
				action: 'Get a conversation',
				description: 'Get a conversation by ID',
				routing: {
					request: { method: 'GET', url: idPath('/conversations', 'conversationId') },
					output: { postReceive: unwrap('data') },
				},
			},
			{
				name: 'Get Many',
				value: 'getAll',
				action: 'Get many conversations',
				description: 'Get conversations, most recently active first',
				routing: {
					request: { method: 'GET', url: '/conversations' },
					output: { postReceive: unwrap('data') },
				},
			},
			{
				name: 'Get Messages',
				value: 'getMessages',
				action: 'Get the messages of a conversation',
				description: 'Get the messages of a conversation, newest first',
				routing: {
					request: { method: 'GET', url: idPath('/conversations', 'conversationId', '/messages') },
					output: { postReceive: unwrap('data', 'messages') },
				},
			},
		],
		default: 'getAll',
	},
	{
		displayName: 'Conversation ID',
		name: 'conversationId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: { show: { ...show, operation: ['get', 'getMessages'] } },
		description: 'The dialnote conversation ID',
	},
	limitField({ resource: 'conversation', operation: 'getAll', max: 100 }),
	{
		displayName: 'Offset',
		name: 'offset',
		type: 'number',
		displayOptions: { show: { ...show, operation: ['getAll'] } },
		typeOptions: { minValue: 0 },
		default: 0,
		description: 'Number of conversations to skip before the first result',
		routing: { send: { type: 'query', property: 'offset' } },
	},
	limitField({ resource: 'conversation', operation: 'getMessages', max: 100 }),
];
