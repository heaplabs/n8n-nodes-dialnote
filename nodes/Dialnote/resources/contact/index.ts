import type { INodeProperties } from 'n8n-workflow';
import { idPath, limitField, unwrap } from '../shared';
import { additionalContactFields } from './fields';

const show = { resource: ['contact'] };

export const contactDescription: INodeProperties[] = [
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
				action: 'Create a contact',
				description: 'Create a contact',
				routing: {
					request: { method: 'POST', url: '/contacts' },
					output: { postReceive: unwrap('data') },
				},
			},
			{
				name: 'Find',
				value: 'find',
				action: 'Find contacts',
				description: 'Find contacts by name, phone number, email or company',
				routing: {
					request: { method: 'GET', url: '/contacts' },
					output: { postReceive: unwrap('data', 'contacts') },
				},
			},
			{
				name: 'Get',
				value: 'get',
				action: 'Get a contact',
				description: 'Get a contact by ID',
				routing: {
					request: { method: 'GET', url: idPath('/contacts', 'contactId') },
					output: { postReceive: unwrap('data') },
				},
			},
			{
				name: 'Update',
				value: 'update',
				action: 'Update a contact',
				description: 'Update a contact; only the fields you add are changed',
				routing: {
					request: { method: 'PUT', url: idPath('/contacts', 'contactId') },
					output: { postReceive: unwrap('data') },
				},
			},
		],
		default: 'find',
	},
	{
		displayName: 'Contact ID',
		name: 'contactId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: { show: { ...show, operation: ['get', 'update'] } },
		description: 'The dialnote contact ID, e.g. from a Find step',
	},
	{
		displayName: 'Phone Number',
		name: 'phoneNumber',
		type: 'string',
		required: true,
		default: '',
		placeholder: '+14155551234',
		displayOptions: { show: { ...show, operation: ['create'] } },
		description: 'E.164 format',
		routing: { send: { type: 'body', property: 'phoneNumber' } },
	},
	additionalContactFields({ operation: 'create', includePhoneNumber: false }),
	additionalContactFields({ operation: 'update', includePhoneNumber: true }),
	{
		displayName: 'Search',
		name: 'search',
		type: 'string',
		required: true,
		default: '',
		displayOptions: { show: { ...show, operation: ['find'] } },
		description: 'Name, phone number, email or company to search for',
		routing: { send: { type: 'query', property: 'search' } },
	},
	limitField({ resource: 'contact', operation: 'find', max: 100 }),
	{
		displayName: 'Page',
		name: 'page',
		type: 'number',
		displayOptions: { show: { ...show, operation: ['find'] } },
		typeOptions: { minValue: 1 },
		default: 1,
		description: 'Page of results to return',
		routing: { send: { type: 'query', property: 'page' } },
	},
];
