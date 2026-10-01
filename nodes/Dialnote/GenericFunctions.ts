import type { ILoadOptionsFunctions, INodePropertyOptions } from 'n8n-workflow';
import { DIALNOTE_PUBLIC_API_BASE_URL } from '../constants';

type MessagingChannel = {
	id: string;
	channelAddress: string;
	displayName?: string | null;
};

/** One dropdown label per channel: name and number, or just the number when there is no distinct name. */
export function channelLabel(channel: MessagingChannel): string {
	const { displayName, channelAddress } = channel;
	return displayName && displayName !== channelAddress
		? `${displayName} (${channelAddress})`
		: channelAddress;
}

/** Powers the "Send From Channel" dropdown of Message > Send. */
export async function getMessagingChannels(
	this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
	const response = (await this.helpers.httpRequestWithAuthentication.call(this, 'dialnoteApi', {
		method: 'GET',
		url: `${DIALNOTE_PUBLIC_API_BASE_URL}/messaging-channels`,
		json: true,
	})) as { data?: MessagingChannel[] };

	return (response.data ?? []).map((channel) => ({
		name: channelLabel(channel),
		value: channel.id,
	}));
}
