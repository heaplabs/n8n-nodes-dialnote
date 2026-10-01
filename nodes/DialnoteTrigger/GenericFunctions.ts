import type { IHookFunctions, IDataObject, IHttpRequestMethods } from 'n8n-workflow';
import { DIALNOTE_API_ORIGIN } from '../constants';

/**
 * The webhook-subscription endpoints live under `/api/hooks`, not under the
 * public REST prefix the action node's requestDefaults use, so the trigger
 * builds the full URL itself.
 */
export async function dialnoteHooksRequest(
	this: IHookFunctions,
	{ method, path, body }: { method: IHttpRequestMethods; path: string; body?: IDataObject },
): Promise<IDataObject> {
	return (await this.helpers.httpRequestWithAuthentication.call(this, 'dialnoteApi', {
		method,
		url: `${DIALNOTE_API_ORIGIN}${path}`,
		json: true,
		...(body ? { body } : {}),
	})) as IDataObject;
}
