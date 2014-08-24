
function Jumper(world) {

	this.shape = new p2.Rectangle(2, 0.2);
	this.shape.material = new p2.Material();
	this.body = new p2.Body({
		mass: 5,
		position: [0, 1.5],
	});
	this.body.addShape(this.shape);
	world.addBody(this.body);
};

Jumper.prototype.jump = function() {
	console.log("TODO");
};
