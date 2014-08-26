var DEBUG = true;

var world, stats, records;
var jumper, controller, ramp;
var camera, scene, renderer;
var clock;

var viewportWidth = 100; // meters

function init() {
	records = new Records(0);
	//camera = new THREE.OrthographicCamera(window.innerWidth / - 2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / - 2, 1, 1000);
	camera = new THREE.OrthographicCamera(-50, 50, 50, -50, 1, 1000);
	camera.position.set(0, 0, 100);

	clock = new THREE.Clock();
	scene = new THREE.Scene();

	if (window.WebGLRenderingContext) // TODO: Better check, use Detector?
		renderer = new THREE.WebGLRenderer({ antialias: true });
	else
		renderer = new THREE.CanvasRenderer();
	renderer.setClearColor(0x6666ff);
	renderer.setSize(window.innerWidth, window.innerHeight);
	document.body.appendChild(renderer.domElement);

	window.addEventListener('resize', resize, false);
	resize();

	// Create a world
	world = new p2.World({
		gravity : [0, -9.81],
	});
	world.solver.iterations = 20;
	world.solver.frictionIterations = 10;

	// Create ramp
	ramp = new FISSlope(world, scene);

	// Create jumper
	jumper = new Jumper(world, scene);
	controller = new Controller(jumper);

	// When the materials of the plane and the first circle meet, they should yield
	// a contact friction specified. We tell p2 this by creating a ContactMaterial.
	for (var i = 0; i < ramp.body.shapes.length; ++i)
	{
		world.addContactMaterial(
			new p2.ContactMaterial(ramp.body.shapes[i].material, jumper.skisShape.material, {friction : 0.0})
			);
	}

	stats = new Stats();
	document.body.appendChild(stats.domElement);
}

function resize() {
	var aspect = window.innerWidth / window.innerHeight;
	camera.left = viewportWidth / - 2;
	camera.right = viewportWidth / 2;
	camera.top = viewportWidth / aspect / 2;
	camera.bottom = viewportWidth / aspect / - 2;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
}

init();

function drawDebug() {
	var msg = "";
	msg += "Position: " + (jumper.body.position[0]|0) + ", " + (jumper.body.position[1]|0) + "\n";
	for (var s in JumperState)
		if (JumperState[s] == jumper.state)
			msg += "State: " + s;
	document.getElementById("debug").innerHTML = msg;
}

var physicsStep = 1/120;
var timeAccumulator = 0;
function render() {
	var dt = clock.getDelta();
	if (dt > 0.05) dt = 0.05; // No bigger deltas than 20 FPS
	timeAccumulator += dt;
	// Input
	controller.poll();
	// Physics
	while (timeAccumulator >= physicsStep) {
		world.step(physicsStep);
		timeAccumulator -= physicsStep;
	}
	jumper.update(dt);
	// Graphics
	jumper.visual.position.x = jumper.body.position[0];
	jumper.visual.position.y = jumper.body.position[1];
	jumper.visual.rotation.z = jumper.body.angle;
	camera.position.x = jumper.visual.position.x;
	camera.position.y = jumper.visual.position.y;
	renderer.render(scene, camera);
	if (DEBUG) drawDebug();
	stats.update();
	requestAnimationFrame(render);
}
render();

