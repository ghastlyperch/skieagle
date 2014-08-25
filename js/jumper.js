
function Jumper(world) {

	var jumperHeight = 1.7;

	this.skisShape = new p2.Rectangle(2.7, 0.02);
	this.skisShape.material = new p2.Material();
	this.jumperShape = new p2.Rectangle(0.3, jumperHeight);
	this.jumperShape.material = new p2.Material();
	this.body = new p2.Body({
		mass: 5,
		position: [5, 101],
	});
	this.body.addShape(this.skisShape);
	this.body.addShape(this.jumperShape, [0, jumperHeight * 0.5]);
	world.addBody(this.body);
};

Jumper.prototype.jump = function() {
	if (this.isOnRamp())
		this.body.velocity[1] = 5;
};

Jumper.prototype.isOnRamp = function() {
	for (var i = 0; i < world.narrowphase.contactEquations.length; i++) {
		var c = world.narrowphase.contactEquations[i];
		if (c.bodyA === this.body || c.bodyB === this.body)
			return true;
	}
	return false;
};

Jumper.prototype.calculateForces = function() {
	// Wind not implemented yet, so speed of air wrt jumper is zero
	var vax = 0, vay = 0;
	
	// Jumper airspeed
	var vX = this.body.velocity[0] - vax;
	var vY = this.body.velocity[1] - vay;
	
	// Square of velocity
	var vSqr = vX*vX + vY*vY
	
	// Air density [kg/m^3]
	var rho = 1.315
	
	// Various angles (in degrees)
	var beta = 9.5; // Body-to-ski
	var gamma = 160; // Hip angle
	var alpha = 35.5; // Angle of attack, this should be calculated based on jumper orientation and airspeed
	
	// These numbers are valid for constant beta and gamma
	var L = -0.43903 + 0.060743*alpha - 7.192e-4*alpha*alpha
	var D = -0.032061 + 0.01232*alpha + 2.283e-4*alpha*alpha

	var liftForce = rho/2*L*vSqr;
	var dragForce = rho/2*D*vSqr;
};
