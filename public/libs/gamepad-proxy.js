const gamepadSchemas = [
	{
		id: " USB Gamepad           (Vendor: 0810 Product: 0001)",
		buttons: [
			2,
			1,
			3,
			0,
			4,
			5,
			6,
			7,
			8,
			9,
			10,
			11,
		],
		axes: [
			0,
			1,
			5,
			2,
		],
		axisToDigitalButtons: [
			9
		]
	},
	{
		id: "Bluetooth Gamepad    (Vendor: 1949 Product: 0403)",
		buttons: [
			0,
			1,
			3,
			4,
			6,
			7,
			8,
			9,
			10,
			11,
			13,
			14,
		],
		axes: [
			0,
			1,
			2,
			5,
		],
		axisToDigitalButtons: [
			9
		]
	}
];

const gamepadProxy = {
	
	additionalGamepads: [],

	getGamepads: function() {
		let gamepads = navigator.getGamepads()
			.map((gp, index) => this.mapGamepad(gp, index));
		
		return [ ...gamepads.filter(gp => gp), ...this.additionalGamepads ];
	},
	
	normalizeAxisPair: function(array) {
		let x = array[0];
		let y = array[1];
		let d2 = x*x + y*y;
		if (d2 > 1) {
			let d = Math.sqrt(d2);
			array[0] /= d;
			array[1] /= d;
		}
	},

	findSchema: function(gamepad, index) {
		if (!gamepad) {
			return null;
		}
		return gamepadSchemas.find(sc => sc.id == gamepad.id);
	},
	
	mapGamepad: function(gamepad, index) {
		let schema = this.findSchema(gamepad, index);
		if (!schema) {
			return gamepad;
		}
		let gamepadMapped = {
			id: gamepad.id,
			buttons: schema.buttons.map(i => gamepad.buttons[i]),
			axes: schema.axes.map(i => Math.round(gamepad.axes[i]*100)/100),
		};
		if (schema.axisToDigitalButtons) {
			schema.axisToDigitalButtons.map(i => gamepad.axes[i])
				.map(axisValue => this.mapAxisToDigitalButtons(axisValue)).flat()
				.forEach(buttonValue => gamepadMapped.buttons.push(this.newButton(buttonValue)));
		}
		return gamepadMapped;
	},
	
	mapAxisToDigitalButtons: function(axisValue) {
		let n = Math.round(7*(axisValue + 1)/2);
		return [
			(n == 7 || n == 0 || n == 1) ? 1 : 0,
			(n == 3 || n == 4 || n == 5) ? 1 : 0,
			(n == 5 || n == 6 || n == 7) ? 1 : 0,
			(n == 1 || n == 2 || n == 3) ? 1 : 0,
		];
	},
	
	newButton: function(buttonValue){
		return {
			pressed: buttonValue == 1,
			touched: buttonValue == 1,
			value: buttonValue,
		};
	},
	
}

export { gamepadSchemas, gamepadProxy }
