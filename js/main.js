var jumper, controller, ramp;

var app = new p2.WebGLRenderer(function(){

	// Create a world
	var world = new p2.World({
		//doProfiling: true,
		gravity : [0, -9.81],
	});
	this.setWorld(world);

	// Create ramp
	var slopeBuilder = new SlopeBuilder();
	ramp = slopeBuilder.buildSlope();
	world.addBody(ramp);

	// Create jumper
	jumper = new Jumper(world);
	controller = new Controller(jumper);

	// When the materials of the plane and the first circle meet, they should yield
	// a contact friction specified. We tell p2 this by creating a ContactMaterial.
	frictionContactMaterial = new p2.ContactMaterial(ramp.shapes[0].material, jumper.skisShape.material, {
		friction : 0,
	});
	world.addContactMaterial(frictionContactMaterial);
}, { lineWidth: 0.1 });

app.frame(0, 0, 100, 80);

function render() {
	requestAnimationFrame(render);
	controller.poll();
	app.centerCamera(jumper.body.position[0], jumper.body.position[1]);
}
render();
