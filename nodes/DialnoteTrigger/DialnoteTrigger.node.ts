import {
	NodeConnectionTypes,
	type IDataObject,
	type IHookFunctions,
	type INodeType,
	type INodeTypeDescription,
	type IWebhookFunctions,
	type IWebhookResponseData,
} from 'n8n-workflow';
import { dialnoteHooksRequest } from './GenericFunctions';

type HookStaticData = { webhookId?: string };

function isNotFound(error: unknown): boolean {
	return (
		typeof error === 'object' &&
		error !== null &&
		(error as { httpCode?: string }).httpCode === '404'
	);
}

/**
 * Starts a workflow when a dialnote call completes or its recording is ready.
 *
 * Activation subscribes through `POST /api/hooks` with `provider: 'n8n'`;
 * dialnote then POSTs the same flat body its Zapier app receives. The
 * subscription is idempotent on the server (same provider + URL + event
 * reuses and reactivates the row), which is why `checkExists` never trusts
 * a cached id: a row deleted in dialnote's Settings would otherwise leave
 * the trigger silently dead until it was toggled off and on.
 */
export class DialnoteTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'dialnote Trigger',
		name: 'dialnoteTrigger',
		icon: { light: 'file:../Dialnote/dialnote.svg', dark: 'file:../Dialnote/dialnote.dark.svg' },
		group: ['trigger'],
		version: 1,
		subtitle: '={{$parameter["event"]}}',
		description: 'Starts the workflow when a dialnote call completes or a recording is ready',
		defaults: {
			name: 'dialnote Trigger',
		},
		inputs: [],
		outputs: [NodeConnectionTypes.Main],
		credentials: [
			{
				name: 'dialnoteApi',
				required: true,
			},
		],
		webhooks: [
			{
				name: 'default',
				httpMethod: 'POST',
				responseMode: 'onReceived',
				path: 'webhook',
			},
		],
		properties: [
			{
				displayName: 'Event',
				name: 'event',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Call Completed',
						value: 'call_log',
						description: 'A call ended; the body carries the call summary',
					},
					{
						name: 'Call Recording Completed',
						value: 'call_recording',
						description: 'A recording (and its transcription summary) is ready',
					},
				],
				default: 'call_log',
			},
		],
	};

	webhookMethods = {
		default: {
			// Always resubscribe: the server dedupes per provider + URL + event and
			// reactivates a disabled row, so `create` is the reliable check.
			async checkExists(this: IHookFunctions): Promise<boolean> {
				return false;
			},

			async create(this: IHookFunctions): Promise<boolean> {
				const staticData = this.getWorkflowStaticData('node') as HookStaticData;
				const response = await dialnoteHooksRequest.call(this, 'POST', '/api/hooks', {
					url: this.getNodeWebhookUrl('default'),
					event: this.getNodeParameter('event') as string,
					provider: 'n8n',
				});
				const data = response.data as IDataObject | undefined;
				const id = data?.id;
				if (typeof id !== 'string' || id.length === 0) {
					return false;
				}
				staticData.webhookId = id;
				return true;
			},

			async delete(this: IHookFunctions): Promise<boolean> {
				const staticData = this.getWorkflowStaticData('node') as HookStaticData;
				const { webhookId } = staticData;
				if (webhookId) {
					try {
						await dialnoteHooksRequest.call(
							this,
							'DELETE',
							`/api/hooks/${encodeURIComponent(webhookId)}`,
						);
					} catch (error) {
						// Already gone (deleted in dialnote's Settings): nothing left to remove.
						if (!isNotFound(error)) {
							return false;
						}
					}
				}
				delete staticData.webhookId;
				return true;
			},
		},
	};

	async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
		const body = this.getBodyData();
		return {
			workflowData: [this.helpers.returnJsonArray(body)],
		};
	}
}
