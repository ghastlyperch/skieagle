var app = new p2.WebGLRenderer(function(){

	// Create a world
	var world = new p2.World({
		//doProfiling: true,
		gravity : [0, -9.81],
	});

	this.setWorld(world);

	// Create a circle
	var shape = new p2.Circle(0.5);
	shape.material = new p2.Material();
	var p = new p2.Body({
		mass: 1,
		position: [0, 1.5],
	});
	p.addShape(shape);
	world.addBody(p);

	// Create ground
	var planeShape = new p2.Plane();
	planeShape.material = new p2.Material();
	var plane = new p2.Body({
		angle: -Math.PI / 8,
	});
	plane.addShape(planeShape);
	world.addBody(plane);

	// When the materials of the plane and the first circle meet, they should yield
	// a contact friction of 0.3. We tell p2 this by creating a ContactMaterial.
	frictionContactMaterial = new p2.ContactMaterial(planeShape.material, shape.material, {
		friction : 0.1,
	});
	world.addContactMaterial(frictionContactMaterial);
});
