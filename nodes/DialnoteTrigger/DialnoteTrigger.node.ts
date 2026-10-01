import {
	NodeConnectionTypes,
	NodeOperationError,
	type IDataObject,
	type IHookFunctions,
	type INodeType,
	type INodeTypeDescription,
	type IWebhookFunctions,
	type IWebhookResponseData,
} from 'n8n-workflow';
import { dialnoteHooksRequest } from './GenericFunctions';

/** What the node remembers between activations: the subscription it owns and the event it was made for. */
type HookStaticData = { webhookId?: string; event?: string };

function isNotFound(error: unknown): boolean {
	return (
		typeof error === 'object' &&
		error !== null &&
		(error as { httpCode?: string }).httpCode === '404'
	);
}

/** Unsubscribe by id; a row already deleted in dialnote's Settings (404) counts as removed. */
async function removeSubscription(this: IHookFunctions, webhookId: string): Promise<boolean> {
	try {
		await dialnoteHooksRequest.call(this, {
			method: 'DELETE',
			path: `/api/hooks/${encodeURIComponent(webhookId)}`,
		});
		return true;
	} catch (error) {
		return isNotFound(error);
	}
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
 *
 * The one case the server cannot dedupe is a changed Event: a subscription for
 * the old event would stay active and keep delivering. `create` therefore
 * remembers the event it subscribed for and removes that subscription before
 * making one for a different event.
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

			// n8n discards `create`'s return value and activates the workflow
			// regardless, so every way of giving up here THROWS: a returned `false`
			// would leave a green, active workflow with no subscription behind it.
			async create(this: IHookFunctions): Promise<boolean> {
				const staticData = this.getWorkflowStaticData('node') as HookStaticData;
				const event = this.getNodeParameter('event') as string;

				// A subscription for a different event would not be deduped by the
				// server and would keep delivering; remove it before subscribing anew.
				if (staticData.webhookId && staticData.event !== event) {
					if (!(await removeSubscription.call(this, staticData.webhookId))) {
						throw new NodeOperationError(
							this.getNode(),
							`Could not remove the previous "${staticData.event}" subscription (${staticData.webhookId}) from dialnote; the trigger was not activated. Delete it under Settings > Webhooks and activate again.`,
						);
					}
					delete staticData.webhookId;
					delete staticData.event;
				}

				const response = await dialnoteHooksRequest.call(this, {
					method: 'POST',
					path: '/api/hooks',
					body: {
						url: this.getNodeWebhookUrl('default'),
						event,
						provider: 'n8n',
					},
				});
				const data = response.data as IDataObject | undefined;
				const id = data?.id;
				if (typeof id !== 'string' || id.length === 0) {
					throw new NodeOperationError(
						this.getNode(),
						`dialnote answered POST /api/hooks without a subscription id (got ${JSON.stringify(response).slice(0, 200)}); the trigger was not activated.`,
					);
				}
				staticData.webhookId = id;
				staticData.event = event;
				return true;
			},

			async delete(this: IHookFunctions): Promise<boolean> {
				const staticData = this.getWorkflowStaticData('node') as HookStaticData;
				const { webhookId } = staticData;
				if (webhookId && !(await removeSubscription.call(this, webhookId))) {
					return false;
				}
				delete staticData.webhookId;
				delete staticData.event;
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
