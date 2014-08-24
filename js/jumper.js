
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
