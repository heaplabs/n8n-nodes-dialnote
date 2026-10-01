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
					request: {
						method: 'GET',
						url: idPath({ prefix: '/conversations', parameter: 'conversationId' }),
					},
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
					request: {
						method: 'GET',
						url: idPath({
							prefix: '/conversations',
							parameter: 'conversationId',
							suffix: '/messages',
						}),
					},
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
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: { show: { ...show, operation: ['getMessages'] } },
		default: false,
		description: 'Whether to return all results or only up to a given limit',
		routing: {
			send: { paginate: '={{ $value }}' },
			operations: {
				// The API pages with { data: { messages, hasMore, nextCursor } } where
				// nextCursor is a compound { cursor: ISO datetime, cursorId: uuid } and the
				// query schema is strict, so both halves go back as their own params.
				pagination: {
					type: 'generic',
					properties: {
						continue: '={{ $response.body.data.hasMore }}',
						request: {
							qs: {
								cursor: '={{ $response.body.data.nextCursor.cursor }}',
								cursorId: '={{ $response.body.data.nextCursor.cursorId }}',
							},
						},
					},
				},
			},
		},
	},
	limitField({
		resource: 'conversation',
		operation: 'getMessages',
		max: 100,
		hiddenWhenReturnAll: true,
	}),
];
