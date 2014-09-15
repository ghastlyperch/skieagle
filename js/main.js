var DEBUG = true;

var world, stats, records;
var jumper, controller, ramp, wind;
var camera, scene, renderer;
var clock, timeScale = 1;
var clouds = [];

var viewportWidth = 80; // meters
var aspect;

function init() {
	initUI();
	records = new Records(0);
	//camera = new THREE.OrthographicCamera(window.innerWidth / - 2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / - 2, 1, 1000);
	camera = new THREE.OrthographicCamera(-50, 50, 50, -50, 1, 1000);
	camera.position.set(0, 0, 100);

	clock = new THREE.Clock();
	scene = new THREE.Scene();

	if (CAPS.webgl) {
		var dpr = window.devicePixelRatio && window.devicePixelRatio > 1 ? 1 + (window.devicePixelRatio - 1)/2 : 1;
		renderer = new THREE.WebGLRenderer({ devicePixelRatio: dpr, alpha: true, antialias: true });
	} else { // Using devicePixelRatio 1 here so that HDPI screens render less pixels -> more performance
		renderer = new THREE.CanvasRenderer({ devicePixelRatio: 1, alpha: true });
	}
	renderer.setClearColor(0x000000, 0);
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

	// Create wind
	wind = new Wind();
	
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

	// Some clouds
	var cloudGeo = new THREE.PlaneGeometry(20, 20);
	var cloudMats = [
		new THREE.MeshBasicMaterial({
			map: THREE.ImageUtils.loadTexture("assets/cloud-01.png"),
			transparent: true, overdraw: 0.25
		}),
		new THREE.MeshBasicMaterial({
			map: THREE.ImageUtils.loadTexture("assets/cloud-02.png"),
			transparent: true, overdraw: 0.25
		})
	];
	for (var i = 0; i < 25; ++i) {
		var cloudMesh = new THREE.Mesh(cloudGeo, cloudMats[i % cloudMats.length]);
		cloudMesh.position.x = -200 + Math.random() * 350
		cloudMesh.position.y = 60 + Math.random() * 50
		cloudMesh.position.z = Math.random() * 50;
		scene.add(cloudMesh);
		clouds.push(cloudMesh);
	}

	stats = new Stats();
	document.body.appendChild(stats.domElement);
	if (DEBUG) $("#mediaquerydebug").style.display = "block";
}

function resize() {
	aspect = window.innerWidth / window.innerHeight;
	camera.left = viewportWidth / - 2;
	camera.right = viewportWidth / 2;
	camera.top = viewportWidth / aspect / 2;
	camera.bottom = viewportWidth / aspect / - 2;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
}

function drawDebug() {
	var msg = "";
	if (!(renderer instanceof THREE.WebGLRenderer))
		msg += "Fallback renderer\n";
	msg += "Position: " + (jumper.body.position[0]|0) + ", " + (jumper.body.position[1]|0) + "\n";
	msg += "Speed: " + Math.round(jumper.speed) + " m/s = " + Math.round(jumper.speed * 3.6) + " km/h\n";
	msg += "Angles: " + (jumper.body.angle * 57.2957795).toFixed(1) + "&deg;, " + (jumper.jumperAngle * 57.2957795).toFixed(1) + "&deg;\n";
	msg += "Forces: " + jumper.forces[0].toFixed(1) + ", " + jumper.forces[1].toFixed(1) + "\n";
	msg += "Wind: " + wind.magnitude.toFixed(1) + "\n";
	for (var s in JumperState)
		if (JumperState[s] == jumper.state)
			msg += "State: " + s + "\n";
	if (controller.motionDebug)
		msg += controller.motionDebug + "\n";
	if (window.devicePixelRatio && window.devicePixelRatio !== 1)
		msg += "DevicePixelRatio: " + window.devicePixelRatio + "\n";
	$("#debug").innerHTML = msg;
}

var physicsStep = 1/120;
var timeAccumulator = 0;
function render() {
	var dt = clock.getDelta();
	if (dt > 0.05) dt = 0.05; // No bigger deltas than 20 FPS
	timeAccumulator += dt * timeScale;
	// Input
	controller.poll(dt);
	// Physics
	while (timeAccumulator >= physicsStep) {
		world.step(physicsStep);
		timeAccumulator -= physicsStep;
	}
	jumper.update(dt);
	for (var i = 0; i < clouds.length; ++i) {
		var cloud = clouds[i];
		cloud.position.x += wind.magnitude * 0.005 * (15 + (i % 5)); // Magic constant to make the clouds not move so fast and add some variablity
		if (cloud.position.x < camera.position.x - viewportWidth * 0.6)
			cloud.position.x += viewportWidth * 1.2
		else if (cloud.position.x > camera.position.x + viewportWidth * 0.6)
			cloud.position.x -= viewportWidth * 1.2
	}
	// Graphics
	camera.position.x = jumper.visual.position.x;
	camera.position.y = Math.max(jumper.visual.position.y, ramp.minY + viewportWidth / aspect / 2);
	renderer.render(scene, camera);
	if (DEBUG) drawDebug();
	stats.update();
	requestAnimationFrame(render);
}

if (CAPS.touch) {
	try {
		init();
		render();
	} catch(e) {
		alert(e.message + "\n" + e.stack);
		console.log(e);
	}
} else {
	init();
	render();
}
