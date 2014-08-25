var world;
var jumper, controller, ramp;
var renderer, scene, container;

function init() {
	renderer = PIXI.autoDetectRenderer(640, 480);
	scene = new PIXI.Stage(0xaaaaff);
	container = new PIXI.DisplayObjectContainer();
	container.scale.x = 1;
	container.scale.y = -1;
	container.position.x =  renderer.width/2; // center at origin
	container.position.y =  renderer.height/2;
	scene.addChild(container);
	document.body.appendChild(renderer.view);

	// Create a world
	world = new p2.World({
		//doProfiling: true,
		gravity : [0, -9.81],
	});

	// Create ramp
	ramp = new Slope(world, container);

	// Create jumper
	jumper = new Jumper(world, container);
	controller = new Controller(jumper);

	// When the materials of the plane and the first circle meet, they should yield
	// a contact friction specified. We tell p2 this by creating a ContactMaterial.
	frictionContactMaterial = new p2.ContactMaterial(ramp.body.shapes[0].material, jumper.skisShape.material, {
		friction : 0,
	});
	world.addContactMaterial(frictionContactMaterial);
}

init();

function render() {
	// Input
	controller.poll();
	// Physics
	world.step(1/60);
	// Graphics
	jumper.visual.position.x = jumper.body.position[0];
	jumper.visual.position.y = jumper.body.position[1];
	jumper.visual.rotation = jumper.body.angle;
	renderer.render(scene);
	requestAnimationFrame(render);
}
render();
