import { NodeConnectionTypes, type INodeType, type INodeTypeDescription } from 'n8n-workflow';
import { getMessagingChannels } from './GenericFunctions';
import { callLogDescription } from './resources/callLog';
import { contactDescription } from './resources/contact';
import { contactNoteDescription } from './resources/contactNote';
import { conversationDescription } from './resources/conversation';
import { conversationNoteDescription } from './resources/conversationNote';
import { messageDescription } from './resources/message';

/**
 * dialnote actions node (declarative). Each resource under ./resources owns its
 * operations and fields; this class carries the credential and the request
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
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{ name: 'Call Log', value: 'callLog' },
					{ name: 'Contact', value: 'contact' },
					{ name: 'Contact Note', value: 'contactNote' },
					{ name: 'Conversation', value: 'conversation' },
					{ name: 'Conversation Note', value: 'conversationNote' },
					{ name: 'Message', value: 'message' },
				],
				default: 'contact',
			},
			...callLogDescription,
			...contactDescription,
			...contactNoteDescription,
			...conversationDescription,
			...conversationNoteDescription,
			...messageDescription,
		],
	};

	methods = {
		loadOptions: {
			getMessagingChannels,
		},
	};
}
