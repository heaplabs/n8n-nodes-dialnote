import type {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	Icon,
	INodeProperties,
} from 'n8n-workflow';

/**
 * A dialnote public API key, sent as a Bearer token.
 *
 * One key authenticates everything the node does: the public REST API for
 * actions and the webhook-subscription endpoints for triggers. Triggers need a
 * full-access key; a read-only key can run reads and searches but cannot
 * subscribe (the API answers 403).
 */
export class DialnoteApi implements ICredentialType {
	name = 'dialnoteApi';

	// Title case is required by n8n's credential linter; the product name is otherwise lowercase.
	displayName = 'Dialnote API';

	icon: Icon = {
		light: 'file:../nodes/Dialnote/dialnote.svg',
		dark: 'file:../nodes/Dialnote/dialnote.dark.svg',
	};

	documentationUrl =
		'https://github.com/heaplabs/n8n-nodes-dialnote?tab=readme-ov-file#credentials';

	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			required: true,
			default: '',
			description:
				'A dialnote public API key (starts with dn_live_). An admin creates one under Settings > API Keys. Use a full-access key if you want triggers.',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '=Bearer {{$credentials.apiKey}}',
			},
		},
	};

	// Any 2xx proves the key is valid and active; team/members is a stable,
	// always-present read that both key types may call.
	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://api.dialnote.com',
			url: '/api/v1/public/team/members',
		},
	};
}
