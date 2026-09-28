import type { INodeProperties } from 'n8n-workflow';
import { idPath, limitField, unwrap } from '../shared';

const show = { resource: ['callLog'] };

export const callLogDescription: INodeProperties[] = [
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
				action: 'Get a call log',
				description: 'Get a call log by ID',
				routing: {
					request: { method: 'GET', url: idPath('/call-logs', 'callLogId') },
					output: { postReceive: unwrap('data') },
				},
			},
			{
				name: 'Get Many',
				value: 'getAll',
				action: 'Get many call logs',
				description: 'Get the most recent call logs',
				routing: {
					// With only `limit` the API answers a plain array under `data`.
					request: { method: 'GET', url: '/call-logs' },
					output: { postReceive: unwrap('data') },
				},
			},
		],
		default: 'getAll',
	},
	{
		displayName: 'Call Log ID',
		name: 'callLogId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: { show: { ...show, operation: ['get'] } },
		description: 'The dialnote call log ID',
	},
	limitField({ resource: 'callLog', operation: 'getAll', max: 100 }),
];
