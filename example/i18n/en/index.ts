import type { BaseTranslation } from '../i18n-types'

const en = {
	// TODO: your translations go here
	HI: 'Hi {name:string}! Please leave a star if you like this project: https://github.com/ivanhofer/typesafe-i18n',
	PLURAL_FULL: "{{zero|one|two|few|many|other}}",
	nested: {
		PLURAL: "hello banana{{s}}",
	},
	schedule: '{0:Date|simpleDate}',
	spectators: '{0} live spectator{{s}}',
} satisfies BaseTranslation

export default en
