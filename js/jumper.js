
var JumperState = {
	WAITING: 0,
	SLIDING: 1,
	JUMPING: 2,
	FLYING:  3,
	LANDING: 4,
	LANDED:  5
};

function Jumper(world, scene) {
	// Physical body
	var jumperHeight = 1.7;
	var skiLength = 2.7;
	this.skiLength = skiLength;
	this.skisShape = new p2.Rectangle(skiLength, 0.02);
	this.skisShape.material = new p2.Material();
	this.jumperShape = new p2.Rectangle(0.3, jumperHeight);
	this.jumperShape.material = new p2.Material();

	this.body = new p2.Body({ mass: 55 });
	this.body.addShape(this.skisShape);
	this.body.addShape(this.jumperShape, [0, jumperHeight * 0.5]);
	world.addBody(this.body);

	// Visual representation
	var skiGeometry = new THREE.PlaneGeometry(this.skisShape.width, 0.2);
	var jumperGeometry = new THREE.PlaneGeometry(this.jumperShape.width, this.jumperShape.height);
	var material = new THREE.MeshBasicMaterial({ color: 0x2222ff });
	this.visual = new THREE.Object3D();
	var skiMesh = new THREE.Mesh(skiGeometry, material);
	skiMesh.position.y = 0.1;
	this.visual.add(skiMesh);
	var jumperMesh = new THREE.Mesh(jumperGeometry, material);
	jumperMesh.position.y = this.jumperShape.height * 0.5;
	this.visual.add(jumperMesh);
	scene.add(this.visual);

	this.reset();
};

Jumper.prototype.reset = function() {
	this.state = JumperState.WAITING;
	this.stateTime = 0;
	this.speed = 0;
	this.topSpeed = 0;
	this.body.sleep();
	var slopeStartingPos = ramp.startingPosition;
	this.body.position[0] = slopeStartingPos[0]; // TODO: Get from slope?
	this.body.position[1] = slopeStartingPos[1];
	this.body.angle = 0;
	var msg = isTouchDevice ? "Tap to start" : "Click to start";
	$("#hint").innerHTML = msg;
	$("#results").style.display = "none";
};

Jumper.prototype.action = function() {
	switch (this.state) {
		case JumperState.WAITING:
			this.state = JumperState.SLIDING;
			this.stateTime = 0;
			this.body.wakeUp();
			$("#hint").innerHTML = "";
			$("#results").style.display = "none";
			break;
		case JumperState.SLIDING:
			if (this.isOnRamp() && this.body.position[0] > -20) { // TODO: Right amount of x
				this.body.velocity[1] = 10;
				this.body.angle = 10.5*Math.PI/180;	
				this.state = JumperState.FLYING; // TODO: Should go to Jumping state to charge the jump
				this.stateTime = 0;
			}
		case JumperState.JUMPING:
			break;
		case JumperState.FLYING:
			break;
		case JumperState.LANDING:
			break;
		case JumperState.LANDED:
			this.reset();
			break;
		default:
			throw "Unkown state " + this.state;
	}
};

Jumper.prototype.steer = function(steer) {
	switch (this.state) {
		case JumperState.WAITING:
			break;
		case JumperState.SLIDING:
			break;
		case JumperState.JUMPING:
			break;
		case JumperState.FLYING:
			// TODO: This is just a place holder, should rotate jumper and not skis
			this.body.angle -= 1 * steer; // Radians per second
			break;
		case JumperState.LANDING:
			break;
		case JumperState.LANDED:
			break;
		default:
			throw "Unkown state " + this.state;
	}
};

Jumper.prototype.update = function(dt) {
	this.stateTime += dt;
	var vx = this.body.velocity[0], vy = this.body.velocity[1];
	this.speed = Math.sqrt(vx*vx + vy*vy);
	if (this.speed > this.topSpeed)
		this.topSpeed = this.speed;

	switch (this.state) {
		case JumperState.WAITING:
			break;
		case JumperState.SLIDING:
			if (this.body.position[0] > 1) {
				this.state = JumperState.FLYING;
				this.stateTime = 0;
			}
			break;
		case JumperState.JUMPING:
			break;
		case JumperState.FLYING:
			this.physics();
			// Round to nearest 0.5m like in real ski jumping
			var d = Number(Math.round((this.body.position[0]*2))/2).toFixed(1);
			$("#hint").innerHTML = d + " m\n Fx: " + this.forces[0].toFixed(1) + "\n Fy: " + this.forces[1].toFixed(1);
			if (this.stateTime > 1 && this.isOnRamp()) {
				records.add(d);
				$("#topspeed").innerHTML = Math.round(jumper.topSpeed * 3.6) + " km/h";
				this.state = JumperState.LANDING;
				this.stateTime = 0;
			}
			break;
		case JumperState.LANDING:
			if (this.stateTime > 1.5) {
				$("#hint").innerHTML = "";
				$("#results").style.display = "block";
				this.state = JumperState.LANDED;
				this.stateTime = 0;
			}
			break;
		case JumperState.LANDED:
			break;
		default:
			throw "Unkown state " + this.state;
	}
	this.visual.position.x = this.body.position[0];
	this.visual.position.y = this.body.position[1];
	this.visual.rotation.z = this.body.angle;
}

Jumper.prototype.isOnRamp = function() {
	for (var i = 0; i < world.narrowphase.contactEquations.length; i++) {
		var c = world.narrowphase.contactEquations[i];
		if (c.bodyA === this.body || c.bodyB === this.body)
			return true;
	}
	return false;
};

Jumper.prototype.physics = function() {
	// Wind not implemented yet, so speed of air wrt jumper is zero
	var vax = 0, vay = 0;
	
	// Jumper airspeed
	var vX = this.body.velocity[0] - vax;
	var vY = this.body.velocity[1] - vay;
	
	// Square of velocity
	var vSqr = vX*vX; // + vY*vY TODO: fix
		
	// Air density [kg/m^3]
	var rho = 1.315
	
	// Various angles (in degrees)
	var beta = 9.5 * Math.PI/180; // Body-to-ski
	var gamma = 160 * Math.PI/180; // Hip angle
	var alpha = this.body.angle; //35.5; // Angle of attack, this should be calculated based on jumper orientation and airspeed
	
	// Lift and drag coefficients
	var cD = 0.1;
	var cL = 0.8;

	// Area projections (0.5 approx width of jumper)
	var aX = 0.5*Math.cos(alpha)*this.skiLength;
	var aY = 0.5*Math.sin(alpha)*this.skiLength;

	// Drag force x and y components
	var dX = 0.5*rho*cD*aX*vX*vX;
	var dY = 0.5*rho*cD*aY*vY*vY;

	// Lift (only y)
	var lY = 0.5*rho*cL*aX*vX*vX;

	// These numbers are valid for constant beta and gamma 
	//var L = -0.43903 + 0.060743*alpha - 7.192e-4*alpha*alpha
	//var D = -0.032061 + 0.01232*alpha + 2.283e-4*alpha*alpha

	//var liftForce = 0; rho/2*L*vSqr;
	//var dragForce = rho/2*D*vSqr;
	
	if (vX > 0) dX *= -1;
	if (vY > 0) dY *= -1;
	
	this.body.setZeroForce();
	this.forces = [dX, lY+dY];
	this.body.applyForce([dX, lY+dY], this.body.position);
};
