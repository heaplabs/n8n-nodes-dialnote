import type { INodeProperties, PostReceiveAction } from 'n8n-workflow';

/**
 * Every dialnote response is an envelope: `{ data, meta }`. Declarative
 * operations unwrap it with a rootProperty chain, one hop per key, so a list
 * nested under `data.contacts` becomes one n8n item per contact.
 */
export function unwrap(...path: string[]): PostReceiveAction[] {
	return path.map((property) => ({ type: 'rootProperty', properties: { property } }));
}

/**
 * A `limit` query parameter shown for one operation of one resource. With
 * `hiddenWhenReturnAll` it disappears once the operation's Return All is on.
 */
export function limitField({
	resource,
	operation,
	max,
	hiddenWhenReturnAll = false,
}: {
	resource: string;
	operation: string;
	max: number;
	hiddenWhenReturnAll?: boolean;
}): INodeProperties {
	return {
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		displayOptions: {
			show: {
				resource: [resource],
				operation: [operation],
				...(hiddenWhenReturnAll ? { returnAll: [false] } : {}),
			},
		},
		typeOptions: { minValue: 1, maxValue: max },
		default: 50,
		description: 'Max number of results to return',
		routing: { send: { type: 'query', property: 'limit' } },
	};
}

/** URL segment for a user-supplied ID: expression-encoded so slashes and spaces cannot break the path. */
export function idPath({
	prefix,
	parameter,
	suffix = '',
}: {
	prefix: string;
	parameter: string;
	suffix?: string;
}): string {
	return `={{ "${prefix}/" + encodeURIComponent($parameter.${parameter}) + "${suffix}" }}`;
}
