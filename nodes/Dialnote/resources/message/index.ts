import type { INodeProperties } from 'n8n-workflow';
import { unwrap } from '../shared';

const show = { resource: ['message'] };

export const messageDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show },
		options: [
			{
				name: 'Send',
				value: 'send',
				action: 'Send an SMS',
				description: 'Send an SMS from one of your dialnote channels',
				routing: {
					request: { method: 'POST', url: '/messages' },
					output: { postReceive: unwrap('data') },
				},
			},
		],
		default: 'send',
	},
	{
		displayName: 'Send From Channel Name or ID',
		name: 'messagingChannelId',
		type: 'options',
		required: true,
		default: '',
		displayOptions: { show: { ...show, operation: ['send'] } },
		typeOptions: { loadOptionsMethod: 'getMessagingChannels' },
		description:
			'The dialnote SMS channel to send from. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
		routing: { send: { type: 'body', property: 'messagingChannelId' } },
	},
	{
		displayName: 'To',
		name: 'recipientAddress',
		type: 'string',
		required: true,
		default: '',
		placeholder: '+14155559876',
		displayOptions: { show: { ...show, operation: ['send'] } },
		description: 'Recipient phone number in E.164 format',
		routing: { send: { type: 'body', property: 'recipientAddress' } },
	},
	{
		displayName: 'Message',
		name: 'body',
		type: 'string',
		typeOptions: { rows: 4 },
		required: true,
		default: '',
		displayOptions: { show: { ...show, operation: ['send'] } },
		description: 'The SMS text (up to 1600 characters)',
		routing: { send: { type: 'body', property: 'body' } },
	},
];
