import { describe, expect, it } from 'vitest';
import { DialnoteApi } from '../credentials/DialnoteApi.credentials';

describe('DialnoteApi credential', () => {
	const credential = new DialnoteApi();

	it('is the credential the node references', () => {
		expect(credential.name).toBe('dialnoteApi');
	});

	it('sends the key as a Bearer token, which is what the dialnote public API verifies', () => {
		expect(credential.authenticate).toEqual({
			type: 'generic',
			properties: { headers: { Authorization: '=Bearer {{$credentials.apiKey}}' } },
		});
	});

	it('tests against a read every key type may call', () => {
		expect(credential.test.request.baseURL).toBe('https://api.dialnote.com');
		expect(credential.test.request.url).toBe('/api/v1/public/team/members');
	});

	it('masks the key in the credential form', () => {
		const [apiKey] = credential.properties;
		expect(apiKey.name).toBe('apiKey');
		expect(apiKey.required).toBe(true);
		expect(apiKey.typeOptions).toEqual({ password: true });
	});
});
