import type { IHookFunctions, IDataObject, IHttpRequestMethods } from 'n8n-workflow';

/**
 * The webhook-subscription endpoints live under `/api/hooks`, not under the
 * public REST prefix the action node uses, so the trigger names the host itself.
 */
export const DIALNOTE_API_ORIGIN = 'https://api.dialnote.com';

export async function dialnoteHooksRequest(
	this: IHookFunctions,
	method: IHttpRequestMethods,
	path: string,
	body?: IDataObject,
): Promise<IDataObject> {
	return (await this.helpers.httpRequestWithAuthentication.call(this, 'dialnoteApi', {
		method,
		url: `${DIALNOTE_API_ORIGIN}${path}`,
		json: true,
		...(body ? { body } : {}),
	})) as IDataObject;
}
