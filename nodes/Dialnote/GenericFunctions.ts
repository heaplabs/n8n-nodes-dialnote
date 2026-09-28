import type { ILoadOptionsFunctions, INodePropertyOptions } from 'n8n-workflow';

type MessagingChannel = {
	id: string;
	channelAddress: string;
	displayName?: string | null;
};

/** One dropdown label per channel: name and number, or just the number. */
export function channelLabel(channel: MessagingChannel): string {
	return channel.displayName
		? `${channel.displayName} (${channel.channelAddress})`
		: channel.channelAddress;
}

/** Powers the "Send From Channel" dropdown of Message > Send. */
export async function getMessagingChannels(
	this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
	const response = (await this.helpers.httpRequestWithAuthentication.call(this, 'dialnoteApi', {
		method: 'GET',
		url: 'https://api.dialnote.com/api/v1/public/messaging-channels',
		json: true,
	})) as { data?: MessagingChannel[] };

	return (response.data ?? []).map((channel) => ({
		name: channelLabel(channel),
		value: channel.id,
	}));
}
