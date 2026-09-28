import { describe, expect, it, vi } from 'vitest';
import type { INodeProperties, INodePropertyOptions, PostReceiveAction } from 'n8n-workflow';
import { Dialnote } from '../nodes/Dialnote/Dialnote.node';
import { channelLabel, getMessagingChannels } from '../nodes/Dialnote/GenericFunctions';

const node = new Dialnote();
const { properties } = node.description;

type Operation = INodePropertyOptions & {
	routing: {
		request: { method: string; url: string };
		output: { postReceive: PostReceiveAction[] };
	};
};

/** Every operation option, tagged with the resource whose `operation` parameter lists it. */
function operations(): Array<{ resource: string; op: Operation }> {
	return properties
		.filter((p) => p.name === 'operation')
		.flatMap((p) =>
			((p.options ?? []) as Operation[]).map((op) => ({
				resource: String((p.displayOptions?.show?.resource ?? [])[0]),
				op,
			})),
		);
}

function rootProperties(actions: PostReceiveAction[]): string[] {
	return actions.map((a) =>
		typeof a === 'object' && a.type === 'rootProperty' ? String(a.properties.property) : '?',
	);
}

function fields(resource: string, operation: string): INodeProperties[] {
	return properties.filter((p) => {
		const show = p.displayOptions?.show;
		return (
			show?.resource?.includes(resource) === true && show.operation?.includes(operation) === true
		);
	});
}

describe('dialnote node', () => {
	it('covers every resource in the resource selector with at least one operation', () => {
		const resourceValues = (properties[0].options as INodePropertyOptions[]).map((o) => o.value);
		const withOperations = new Set(operations().map((o) => o.resource));
		expect(resourceValues.sort()).toEqual([...withOperations].sort());
	});

	it('routes every operation through a relative URL so requestDefaults.baseURL applies', () => {
		const all = operations();
		expect(all.length).toBe(12);
		for (const { op } of all) {
			expect(op.routing.request.method, op.value as string).toMatch(/^(GET|POST|PUT)$/);
			expect(op.routing.request.url, op.value as string).not.toContain('http');
			expect(op.action, op.value as string).toBeTruthy();
		}
	});

	it('unwraps the { data } envelope, and the nested list for find and getMessages', () => {
		const byKey = Object.fromEntries(
			operations().map(({ resource, op }) => [
				`${resource}.${op.value}`,
				rootProperties(op.routing.output.postReceive),
			]),
		);
		expect(byKey['contact.find']).toEqual(['data', 'contacts']);
		expect(byKey['conversation.getMessages']).toEqual(['data', 'messages']);
		expect(byKey['callLog.getAll']).toEqual(['data']);
		expect(byKey['conversation.getAll']).toEqual(['data']);
		expect(byKey['message.send']).toEqual(['data']);
		for (const chain of Object.values(byKey)) {
			expect(chain[0]).toBe('data');
		}
	});

	it('requires exactly the fields the public API requires', () => {
		const required = (resource: string, operation: string): string[] =>
			fields(resource, operation)
				.filter((f) => f.required)
				.map((f) => f.name)
				.sort();
		expect(required('message', 'send')).toEqual(['body', 'messagingChannelId', 'recipientAddress']);
		expect(required('contact', 'create')).toEqual(['phoneNumber']);
		expect(required('contact', 'update')).toEqual(['contactId']);
		expect(required('contactNote', 'create')).toEqual(['contactId', 'content']);
		expect(required('conversationNote', 'create')).toEqual(['content', 'conversationId']);
	});

	it('sends optional contact attributes only when added, never as empty strings', () => {
		for (const operation of ['create', 'update']) {
			const additional = fields('contact', operation).find((f) => f.name === 'additionalFields');
			expect(additional?.type, operation).toBe('collection');
			const names = (additional?.options ?? []).map((o) => o.name).sort();
			expect(names).toContain('email');
			expect(names.includes('phoneNumber')).toBe(operation === 'update');
		}
	});

	it('encodes IDs placed in the path', () => {
		const get = operations().find(
			({ resource, op }) => resource === 'contact' && op.value === 'get',
		);
		expect(get?.op.routing.request.url).toContain('encodeURIComponent($parameter.contactId)');
	});
});

describe('getMessagingChannels', () => {
	it('labels a channel by name and number, or just the number', () => {
		expect(
			channelLabel({ id: '1', displayName: 'Main line', channelAddress: '+14155551234' }),
		).toBe('Main line (+14155551234)');
		expect(channelLabel({ id: '2', displayName: null, channelAddress: '+14155559999' })).toBe(
			'+14155559999',
		);
	});

	it('maps the { data } envelope to dropdown options through the credential', async () => {
		const request = vi.fn().mockResolvedValue({
			data: [{ id: 'ch_1', displayName: 'Main line', channelAddress: '+14155551234' }],
		});
		const context = { helpers: { httpRequestWithAuthentication: request } };
		const options = await getMessagingChannels.call(context as never);
		expect(options).toEqual([{ name: 'Main line (+14155551234)', value: 'ch_1' }]);
		// `.call(this, …)`: the load-options context is the receiver, the credential name the first argument.
		expect(request.mock.contexts[0]).toBe(context);
		expect(request).toHaveBeenCalledWith(
			'dialnoteApi',
			expect.objectContaining({
				method: 'GET',
				url: expect.stringContaining('/messaging-channels'),
			}),
		);
	});
});
