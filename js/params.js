var Params = {

	Slopes: {
		"HS60": {
			name: "Schattenbergschanze",
			city: "Oberstdorf",
			country: "GER",
			HS: 60,
			friction: 0.1,
			takeOffCoeff: 1.1
		},
		"HS100": {
			name: "Miyanomori",
			city: "Sapporo",
			country: "JAP",
			HS: 100,
			friction: 0.05,
			takeOffCoeff: 1.2
		},
		"HS142": {
			name: "Rukatunturi",
			city: "Kuusamo",
			country: "FIN",
			HS: 142,
			friction: 0.05,
			takeOffCoeff: 1.4
		},
		"HS225": {
			name: "Vikersundbakken",
			city: "Vikersund",
			country: "NOR",
			HS: 225,
			friction: 0.01,
			takeOffCoeff: 2.0
		},
		"eegg": {
			name: "Super Flight Mode",
			city: "Easter Egg",
			HS: 500,
			friction: 0.0001,
			takeOffCoeff: 6.0
		}
	},

	Jumper: {
		height: 1.78,
		mass: 65,
		skiLength: 2.5,
		takeoffStr: 0.05,
		takeoffTargetAngle: -75 * Math.PI/180,
		landingTargetAngle: -15 * Math.PI/180,
		angVelToFlyPosition: -2.4,
		angVelToLandingPosition: 2.4
	},

	Wind: {
		maxSpeed: 3,
		maxChangePerSec: 0.3
	}

};
