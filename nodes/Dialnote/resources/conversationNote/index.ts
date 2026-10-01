import type { INodeProperties } from 'n8n-workflow';
import { idPath, unwrap } from '../shared';

const show = { resource: ['conversationNote'] };

export const conversationNoteDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show },
		options: [
			{
				name: 'Create',
				value: 'create',
				action: 'Add a note to a conversation',
				description: 'Add a note to a conversation',
				routing: {
					request: {
						method: 'POST',
						url: idPath({
							prefix: '/conversations',
							parameter: 'conversationId',
							suffix: '/notes',
						}),
					},
					output: { postReceive: unwrap('data') },
				},
			},
		],
		default: 'create',
	},
	{
		displayName: 'Conversation ID',
		name: 'conversationId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: { show: { ...show, operation: ['create'] } },
		description: 'The conversation to add the note to',
	},
	{
		displayName: 'Note',
		name: 'content',
		type: 'string',
		typeOptions: { rows: 4 },
		required: true,
		default: '',
		displayOptions: { show: { ...show, operation: ['create'] } },
		description: 'Note content (Markdown supported, up to 5000 characters)',
		routing: { send: { type: 'body', property: 'content' } },
	},
];
