import type { INodePropertyCollection, INodeProperties } from 'n8n-workflow';

/**
 * The optional contact attributes the public API accepts on create and update.
 * Offered as an "Additional Fields" collection so only the fields a user adds
 * are sent; an empty string in a PUT body would blank the attribute.
 */
const optionalContactFields: INodeProperties[] = [
	{
		displayName: 'Background',
		name: 'background',
		type: 'string',
		typeOptions: { rows: 3 },
		default: '',
		description: 'Free-text notes about the contact',
		routing: { send: { type: 'body', property: 'background' } },
	},
	{
		displayName: 'Company',
		name: 'company',
		type: 'string',
		default: '',
		routing: { send: { type: 'body', property: 'company' } },
	},
	{
		displayName: 'Country Code',
		name: 'countryCode',
		type: 'string',
		default: '',
		description: 'ISO country code, e.g. US or GB',
		routing: { send: { type: 'body', property: 'countryCode' } },
	},
	{
		displayName: 'Email',
		name: 'email',
		type: 'string',
		placeholder: 'name@email.com',
		default: '',
		routing: { send: { type: 'body', property: 'email' } },
	},
	{
		displayName: 'First Name',
		name: 'firstName',
		type: 'string',
		default: '',
		routing: { send: { type: 'body', property: 'firstName' } },
	},
	{
		displayName: 'Job Title',
		name: 'jobTitle',
		type: 'string',
		default: '',
		routing: { send: { type: 'body', property: 'jobTitle' } },
	},
	{
		displayName: 'Last Name',
		name: 'lastName',
		type: 'string',
		default: '',
		routing: { send: { type: 'body', property: 'lastName' } },
	},
];

export function additionalContactFields({
	operation,
	includePhoneNumber,
}: {
	operation: string;
	includePhoneNumber: boolean;
}): INodeProperties {
	const options: Array<INodeProperties | INodePropertyCollection> = [...optionalContactFields];
	if (includePhoneNumber) {
		options.push({
			displayName: 'Phone Number',
			name: 'phoneNumber',
			type: 'string',
			default: '',
			description: 'E.164 format, e.g. +14155551234',
			routing: { send: { type: 'body', property: 'phoneNumber' } },
		});
	}
	return {
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { resource: ['contact'], operation: [operation] } },
		options,
	};
}
