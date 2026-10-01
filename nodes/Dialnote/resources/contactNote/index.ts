import type { INodeProperties } from 'n8n-workflow';
import { idPath, unwrap } from '../shared';

const show = { resource: ['contactNote'] };

export const contactNoteDescription: INodeProperties[] = [
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
				action: 'Add a note to a contact',
				description: 'Add a note to a contact',
				routing: {
					request: {
						method: 'POST',
						url: idPath({ prefix: '/contacts', parameter: 'contactId', suffix: '/notes' }),
					},
					output: { postReceive: unwrap('data') },
				},
			},
		],
		default: 'create',
	},
	{
		displayName: 'Contact ID',
		name: 'contactId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: { show: { ...show, operation: ['create'] } },
		description: 'The contact to add the note to, e.g. from a Find Contact step',
	},
	{
		displayName: 'Note',
		name: 'content',
		type: 'string',
		typeOptions: { rows: 4 },
		required: true,
		default: '',
		displayOptions: { show: { ...show, operation: ['create'] } },
		description: 'Plain-text note (up to 5000 characters)',
		routing: { send: { type: 'body', property: 'content' } },
	},
];
