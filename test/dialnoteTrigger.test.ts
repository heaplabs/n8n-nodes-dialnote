import { describe, expect, it, vi } from 'vitest';
import type { IDataObject } from 'n8n-workflow';
import { DialnoteTrigger } from '../nodes/DialnoteTrigger/DialnoteTrigger.node';

const node = new DialnoteTrigger();
const hooks = node.webhookMethods.default;
const WEBHOOK_URL = 'https://acme.app.n8n.cloud/webhook-test/0192a1b2/webhook';

function hookContext({
	staticData = {},
	request = vi.fn().mockResolvedValue({ data: { id: 'hook_1' } }),
}: {
	staticData?: IDataObject;
	request?: ReturnType<typeof vi.fn>;
} = {}) {
	return {
		staticData,
		request,
		ctx: {
			getWorkflowStaticData: () => staticData,
			getNodeWebhookUrl: () => WEBHOOK_URL,
			getNodeParameter: (name: string) => (name === 'event' ? 'call_log' : undefined),
			helpers: { httpRequestWithAuthentication: request },
		},
	};
}

describe('dialnote Trigger', () => {
	it('is a trigger node with one POST webhook and the dialnote credential', () => {
		const { description } = node;
		expect(description.group).toEqual(['trigger']);
		expect(description.inputs).toEqual([]);
		expect(description.webhooks).toEqual([
			{ name: 'default', httpMethod: 'POST', responseMode: 'onReceived', path: 'webhook' },
		]);
		expect(description.credentials).toEqual([{ name: 'dialnoteApi', required: true }]);
		const event = description.properties.find((p) => p.name === 'event');
		expect((event?.options ?? []).map((o) => ('value' in o ? o.value : null))).toEqual([
			'call_log',
			'call_recording',
		]);
	});

	it("create subscribes with the workflow's webhook URL, the event and provider n8n, and stores the returned id", async () => {
		const { ctx, request, staticData } = hookContext();

		await expect(hooks.create.call(ctx as never)).resolves.toBe(true);

		expect(request.mock.contexts[0]).toBe(ctx);
		expect(request).toHaveBeenCalledWith(
			'dialnoteApi',
			expect.objectContaining({
				method: 'POST',
				url: 'https://api.dialnote.com/api/hooks',
				body: { url: WEBHOOK_URL, event: 'call_log', provider: 'n8n' },
			}),
		);
		expect(staticData.webhookId).toBe('hook_1');
	});

	it('checkExists is false even when an id is stored, and create overwrites the stored id', async () => {
		const { ctx, staticData } = hookContext({ staticData: { webhookId: 'stale' } });

		await expect(hooks.checkExists.call(ctx as never)).resolves.toBe(false);
		await hooks.create.call(ctx as never);
		expect(staticData.webhookId).toBe('hook_1');
	});

	it('create reports failure when the API returns no id', async () => {
		const { ctx, staticData } = hookContext({ request: vi.fn().mockResolvedValue({ data: {} }) });
		await expect(hooks.create.call(ctx as never)).resolves.toBe(false);
		expect(staticData.webhookId).toBeUndefined();
	});

	it('delete unsubscribes by the stored id and clears it', async () => {
		const request = vi.fn().mockResolvedValue({ data: { success: true } });
		const { ctx, staticData } = hookContext({ staticData: { webhookId: 'hook_1' }, request });

		await expect(hooks.delete.call(ctx as never)).resolves.toBe(true);

		expect(request).toHaveBeenCalledWith(
			'dialnoteApi',
			expect.objectContaining({
				method: 'DELETE',
				url: 'https://api.dialnote.com/api/hooks/hook_1',
			}),
		);
		expect(staticData.webhookId).toBeUndefined();
	});

	it('delete still clears the id when the row is already gone (404), but not on other errors', async () => {
		const gone = Object.assign(new Error('not found'), { httpCode: '404' });
		const goneCtx = hookContext({
			staticData: { webhookId: 'hook_1' },
			request: vi.fn().mockRejectedValue(gone),
		});
		await expect(hooks.delete.call(goneCtx.ctx as never)).resolves.toBe(true);
		expect(goneCtx.staticData.webhookId).toBeUndefined();

		const down = Object.assign(new Error('boom'), { httpCode: '500' });
		const downCtx = hookContext({
			staticData: { webhookId: 'hook_1' },
			request: vi.fn().mockRejectedValue(down),
		});
		await expect(hooks.delete.call(downCtx.ctx as never)).resolves.toBe(false);
		expect(downCtx.staticData.webhookId).toBe('hook_1');
	});

	it('delete with nothing stored is a no-op that succeeds', async () => {
		const { ctx, request } = hookContext();
		await expect(hooks.delete.call(ctx as never)).resolves.toBe(true);
		expect(request).not.toHaveBeenCalled();
	});

	it('webhook() hands the POSTed body to the workflow as one item', async () => {
		const body = {
			id: 'CA123',
			event_type: 'call_log',
			contact_id: 'c1',
			timestamp: 't',
			call: {},
		};
		const ctx = {
			getBodyData: () => body,
			helpers: { returnJsonArray: (d: IDataObject) => [{ json: d }] },
		};
		await expect(node.webhook.call(ctx as never)).resolves.toEqual({
			workflowData: [[{ json: body }]],
		});
	});
});
