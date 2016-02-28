var Params = {

	Slopes: {
		"K80": {
			HS: 80,
			friction: 0.25,
			takeOffCoeff: 1
		},
		"K120": {
			HS: 120,
			friction: 0.15,
			takeOffCoeff: 1
		},
		"K160": {
			HS: 160,
			friction: 0.05,
			takeOffCoeff: 1.2
		},
		"K200": {
			HS: 200,
			friction: 0.01,
			takeOffCoeff: 1.45
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
