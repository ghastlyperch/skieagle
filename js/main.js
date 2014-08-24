var app = new p2.WebGLRenderer(function(){

	// Create a world
	var world = new p2.World({
		//doProfiling: true,
		gravity : [0, -9.81],
	});
	this.setWorld(world);

	// Create ground
	var planeShape = new p2.Plane();
	planeShape.material = new p2.Material();
	var plane = new p2.Body({
		angle: -Math.PI / 8,
	});
	plane.addShape(planeShape);
	world.addBody(plane);

	// Create jumper
	var jumper = new Jumper(world);
	var controller = new Controller(jumper);

	// When the materials of the plane and the first circle meet, they should yield
	// a contact friction specified. We tell p2 this by creating a ContactMaterial.
	frictionContactMaterial = new p2.ContactMaterial(planeShape.material, jumper.skisShape.material, {
		friction : 0.1,
	});
	world.addContactMaterial(frictionContactMaterial);
});
