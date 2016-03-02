var DEBUG = window.location.hash.contains("#debug");

var world, stats, records;
var jumper, controller, ramp, wind;
var camera, scene, renderer;
var clock, timeScale = 1;
var clouds = [];

var viewportWidth = 80; // meters
var aspect;

function init() {
	var hillId = window.location.search.substr(1);
	var recordPrefix = "0";
	var hillParams = {};
	if (Params.Slopes[hillId]) {
		recordPrefix = hillId;
		hillParams = Params.Slopes[hillId];
		console.log("Hill " + hillId + " with hill size " + hillParams.HS);
		initUI(hillParams);
	} else initUI(null);

	records = new Records(recordPrefix);
	//camera = new THREE.OrthographicCamera(window.innerWidth / - 2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / - 2, 1, 1000);
	camera = new THREE.OrthographicCamera(-50, 50, 50, -50, 1, 1000);
	camera.position.set(0, 0, 100);

	clock = new THREE.Clock();
	scene = new THREE.Scene();

	if (CAPS.webgl && !window.location.hash.contains("#nowebgl")) {
		var dpr = window.devicePixelRatio && window.devicePixelRatio > 1 ? 1 + (window.devicePixelRatio - 1)/2 : 1;
		renderer = new THREE.WebGLRenderer({ devicePixelRatio: dpr, alpha: true, antialias: true });
	} else { // Using devicePixelRatio 1 here so that HDPI screens render less pixels -> more performance
		renderer = new THREE.CanvasRenderer({ devicePixelRatio: 1, alpha: true });
	}
	renderer.setClearColor(0x000000, 0);
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.domElement.id = "canvas";
	document.body.appendChild(renderer.domElement);

	window.addEventListener('resize', resize, false);
	resize();

	// Create wind
	wind = new Wind();

	// Create ramp
	ramp = new FISSlope(world, scene, hillParams);
	ramp.setRecord(records.records.allTime.distance);

	// Create jumper
	jumper = new Jumper(world, scene, hillParams.takeOffCoeff, hillParams.liftCoeff);
	if ($("#menu-container").style.display === "none")
		controller = new Controller(jumper);

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
	var cloudStart = Math.min(20, ramp.startingPosition[1]);
	var cloudEnd = ramp.startingPosition[1] + 20;
	for (var i = 0; i < 25; ++i) {
		var cloudMesh = new THREE.Mesh(cloudGeo, cloudMats[i % cloudMats.length]);
		cloudMesh.position.x = -200 + Math.random() * 350
		cloudMesh.position.y = cloudStart + (cloudEnd - cloudStart) * Math.random();
		cloudMesh.position.z = -Math.random() * 50;
		scene.add(cloudMesh);
		clouds.push(cloudMesh);
	}

	stats = new Stats();
	if (DEBUG) {
		document.body.appendChild(stats.domElement);
		$("#debug").style.display = "block";
		$("#mediaquerydebug").style.display = "block";
	}
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
	msg += "Position: " + (jumper.pBody.x|0) + ", " + (jumper.pBody.y|0) + "\n";
	msg += "Jumper y interp: " + ramp.getYandAngle(jumper.pBody.x).y.toFixed(2) + "\n";
	msg += "Jumper angle interp: " + (Math.atan(ramp.getYandAngle(jumper.pBody.x).angle)*180/Math.PI).toFixed(2) + "\n";
	msg += "pBody onRamp(): " + jumper.pBody.onRamp() + "\n";
	msg += "Speed: " + Math.round(jumper.speed) + " m/s = " + Math.round(jumper.speed * 3.6) + " km/h\n";
	msg += "Angles: " + (jumper.pBody.theta * 57.2957795).toFixed(1) + "&deg;, " + (jumper.jumperAngle * 57.2957795).toFixed(1) + "&deg;\n";
	msg += "Forces: " + jumper.forces[0].toFixed(1) + ", " + jumper.forces[1].toFixed(1) + "\n";
	msg += "Wind: " + wind.magnitude.toFixed(1) + "\n";
	for (var s in JumperState)
		if (JumperState[s] == jumper.state)
			msg += "State: " + s + "\n";
	if (controller && controller.motionDebug)
		msg += controller.motionDebug + "\n";
	if (window.devicePixelRatio && window.devicePixelRatio !== 1)
		msg += "DevicePixelRatio: " + window.devicePixelRatio + "\n";
	$("#debugmsg").innerHTML = msg;
	// Debug sliders
	$("#debugparamlabel").innerHTML = $("#debugparam").value;
	// something = window.parseFloat($("#debugparam").value);
}

function render() {
	var dt = clock.getDelta();
	var clampDt = 0.05; // No bigger deltas than 20 FPS
	if (dt > clampDt) dt = clampDt;
	dt *= timeScale;
	// Input
	if (controller)
		controller.poll(dt);
	// Physics
	jumper.pBody.step(dt);
	jumper.update(dt);
	wind.update(dt);
	for (var i = 0; i < clouds.length; ++i) {
		var cloud = clouds[i];
		cloud.position.x += wind.magnitude * 0.005 * (15 + (i % 5)); // Magic constant to make the clouds not move so fast and add some variablity
		if (cloud.position.x < camera.position.x - viewportWidth * 0.6)
			cloud.position.x += viewportWidth * 1.2
		else if (cloud.position.x > camera.position.x + viewportWidth * 0.6)
			cloud.position.x -= viewportWidth * 1.2
	}
	// Graphics
	camera.position.x = Math.min(jumper.visual.position.x + viewportWidth * 0.2, ramp.maxX - viewportWidth / 2);
	camera.position.x = Math.max(camera.position.x, ramp.minX + viewportWidth / 2);
	camera.position.y = Math.max(jumper.visual.position.y, ramp.minY + viewportWidth / aspect / 2);
	renderer.render(scene, camera);
	if (DEBUG) {
		drawDebug();
		stats.update();
	}
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
