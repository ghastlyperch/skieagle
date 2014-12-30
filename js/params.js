var Params = {

	Slopes: {
		"K80": 80,
		"K100": 100,
		"K120": 120,
		"K200": 200
	},

	Jumper: {
		height: 1.78,
		mass: 65,
		skiLength: 2.5,
		takeoffStr: 0.05,
		takeoffTargetAngle: -85 * Math.PI/180,
		landingTargetAngle: -15 * Math.PI/180,
		angVelToFlyPosition: -2.4,
		angVelToLandingPosition: 2.4
	},

	Wind: {
		maxSpeed: 3,
		maxChangePerSec: 0.3
	}

};
