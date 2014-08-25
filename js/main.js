var world;
var jumper, controller, ramp;
var camera, scene, renderer;

function init() {
	//camera = new THREE.OrthographicCamera(window.innerWidth / - 2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / - 2, 1, 1000);
	camera = new THREE.OrthographicCamera(-100, 100, 100, -100, 1, 1000);
	camera.position.set(0, 0, 100);

	scene = new THREE.Scene();

	renderer = new THREE.WebGLRenderer();
	renderer.setClearColor(0x9999ff);
	renderer.setSize(window.innerWidth, window.innerHeight);
	document.body.appendChild(renderer.domElement);

	// Create a world
	world = new p2.World({
		gravity : [0, -9.81],
	});

	// Create ramp
	ramp = new Slope(world, scene);

	// Create jumper
	jumper = new Jumper(world, scene);
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
	jumper.visual.rotation.z = jumper.body.angle;
	camera.position.x = jumper.visual.position.x;
	camera.position.y = jumper.visual.position.y;
	renderer.render(scene, camera);
	requestAnimationFrame(render);
}
render();
