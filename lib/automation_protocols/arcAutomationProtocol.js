module.exports = function arc (elric) {

	this.name = 'arc';
	this.title = 'ARC';
	this.description = 'A protocol commonly rebranded, for example: KAKU, Elro, ...';
	
	this.addressBlueprint = {
		house_code: {
			title: 'House Code',
			fieldType: 'Select',
			source: {type: 'given', values: {
				1: 'A',
				2: 'B',
				3: 'C',
				4: 'D',
				5: 'E',
				6: 'F',
				7: 'G',
				8: 'H',
				9: 'I',
				10: 'J',
				11: 'K',
				12: 'L',
				13: 'M',
				14: 'N',
				15: 'O',
				16: 'P'
			}}
		},
		unit_code: {
			title: 'Unit Code',
			fieldType: 'Select',
			source: {type: 'given', values: {
				1: 1,
				2: 2,
				3: 3,
				4: 4,
				5: 5,
				6: 6,
				7: 7,
				8: 8,
				9: 9,
				10: 10,
				11: 11,
				12: 12,
				13: 13,
				14: 14,
				15: 15,
				16: 16
			}}
		}
	};
	
}