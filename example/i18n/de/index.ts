import type { Translation } from '../i18n-types'

const de: Translation = {
	// this is an example Translation, just rename or delete this folder if you want
	HI: 'Hallo {name}! Bitte hinterlasse einen Stern, wenn dir das Projekt gefällt: https://github.com/ivanhofer/typesafe-i18n',
	PLURAL_FULL: "{{zero|one|two|few|many|other}}",
	nested: {
		PLURAL: "Hallo {{Banane|Bananen}}",
	},
	schedule: '{0|simpleDate}',
	spectators: '{0} Zuschauer live',
	array: {
		work: 'auch',
		values: ['a', 'b', 'c']
	}
}

export default de
