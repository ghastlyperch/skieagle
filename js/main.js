var app = new p2.WebGLRenderer(function(){

	// Create a world
	var world = new p2.World({
		//doProfiling: true,
		gravity : [0, -9.81],
	});
	this.setWorld(world);

	// Create ramp
	var rampData = [ 80, 70, 60, 50, 40, 35, 30, 25, 20, 15, 10, 10, 0, 0, 0, 0, 0, 0, 0, 0, 5 ];
	var rampShape = new p2.Heightfield(rampData, {
		elementWidth: 5.0
	});
	rampShape.material = new p2.Material();
	var ramp = new p2.Body();
	ramp.addShape(rampShape);
	world.addBody(ramp);

	// Create jumper
	var jumper = new Jumper(world);
	var controller = new Controller(jumper);

	// When the materials of the plane and the first circle meet, they should yield
	// a contact friction specified. We tell p2 this by creating a ContactMaterial.
	frictionContactMaterial = new p2.ContactMaterial(rampShape.material, jumper.skisShape.material, {
		friction : 0,
	});
	world.addContactMaterial(frictionContactMaterial);
});
