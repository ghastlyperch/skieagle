
var JumperState = {
	WAITING: 0,
	SLIDING: 1,
	JUMPING: 2,
	FLYING:  3,
	LANDING: 4,
	LANDED:  5
};

var PhysicsMode = {
	PARAMETRIC: 0,
	SIMPLE_LIFTDRAG: 1
};

function Jumper(world, scene, takeoff_coeff) {
	// Physics solver mode
	this.physicsMode = PhysicsMode.SIMPLE_LIFTDRAG;

	// Physical body
	var jumperHeight = Params.Jumper.height;
	var skiLength = Params.Jumper.skiLength;
	this.angleAtLanding = 0;
	this.minAngleAfterLanding = 0;
	this.maxAngleAfterLanding = 0;
	this.skiLength = skiLength;
	this.jumperTargetAngle = 0;
	this.landingStart = 0;
	this.takeOffCoeff = takeoff_coeff;
	this.pBody = new PhysicsObject(Params.Jumper.mass,0,0,ramp);

	// Visual representation
	var skiGeometry = new THREE.PlaneGeometry(skiLength, 0.2);
	var skiMaterial = new THREE.MeshBasicMaterial({
		map: THREE.ImageUtils.loadTexture("assets/ski.png"),
		transparent: true
	});
	this.visual = new THREE.Object3D();
	var skiMesh = new THREE.Mesh(skiGeometry, skiMaterial);
	skiMesh.position.y = 0.1;
	this.visual.add(skiMesh);
	var jumperGeometry = new THREE.PlaneGeometry(0.5 * jumperHeight, jumperHeight);
	jumperGeometry.applyMatrix((new THREE.Matrix4()).makeTranslation(0, jumperHeight * 0.5 + 0.1, 0)); // Move center
	var jumperMaterial = new THREE.MeshBasicMaterial({
		map: THREE.ImageUtils.loadTexture("assets/jumper.png"),
		transparent: true
	});
	var jumperMesh = new THREE.Mesh(jumperGeometry, jumperMaterial);
	jumperMesh.position.x = -1/5 * this.skiLength;
	this.visual.add(jumperMesh);
	scene.add(this.visual);

	this.reset();
};

Jumper.prototype.reset = function() {
	wind.reset();
	this.state = JumperState.WAITING;
	this.stateTime = 0;
	this.speed = 0;
	this.topSpeed = 0;
	this.forces = [0, 0];
	this.pBody.sleep();
	var slopeStartingPos = ramp.startingPosition;
	this.pBody.x = slopeStartingPos[0];

	// Set jumper starting position y-coordinate and angle so that the jumper starts on the slope at right angle
	var startYTheta = ramp.getYandAngle(this.pBody.x);
	this.pBody.y = startYTheta.y;
	this.pBody.theta = Math.atan(startYTheta.angle);
	this.pBody.vX = 0; this.pBody.vY = 0;
	this.pBody.aX = 0; this.pBody.aY = 0;
	this.pBody.friction = 0.01;
	this.jumperAngle = -10 * Math.PI / 180;
	this.landingStart = 0;
	this.landingPoints = 0;
	this.charge = 0;
	var msg = CAPS.touch ? "Tap to start" : "Click to start";
	$("#hint").innerHTML = msg;
	$("#results").style.display = "none";
	$("#power-container").style.display = "none";
};

Jumper.prototype.changeState = function(state) {
	this.state = state;
	this.stateTime = 0;
};

Jumper.prototype.action = function(pressed) {
	switch (this.state) {
		case JumperState.WAITING:
			if (!pressed) break;
			this.changeState(JumperState.SLIDING);
			this.pBody.wakeUp();
			$("#hint").innerHTML = "";
			$("#results").style.display = "none";
			break;
		case JumperState.SLIDING:
			if (pressed && this.isOnRamp() && this.pBody.x > ramp.chargePoint) {
				this.changeState(JumperState.JUMPING);
				$("#power-container").style.display = "block";
			}
			break;
		case JumperState.JUMPING:
			if (!pressed && this.isOnRamp()) {
				this.pBody.vY = this.charge * Params.Jumper.takeoffStr * this.takeOffCoeff;
				console.log('Takeoff velocity: ' + this.charge * Params.Jumper.takeoffStr)
				// Set target body angle while flying based on jump timing
				// TODO: find out optimum angle and replace 85 with it.
				this.jumperTargetAngle = 0.01 * this.charge * Params.Jumper.takeoffTargetAngle;
				this.pBody.theta = 0;
				this.changeState(JumperState.FLYING);
			}
			break;
		case JumperState.FLYING:
			this.landingStart = this.stateTime;
			console.log("Landing started: " + this.landingStart);
			this.jumperTargetAngle = Params.Jumper.landingTargetAngle;
			console.log("Jumper angle: " + this.pBody.theta*180/Math.PI);
			break;
		case JumperState.LANDING:
			break;
		case JumperState.LANDED:
			if (pressed)
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
			// Steering enabled only if landing manouver has not started yet
			if (this.landingStart == 0) {
				this.jumperAngle -= 1 * steer; // Radians per second
				this.jumperAngle = THREE.Math.clamp(this.jumperAngle, -80 * Math.PI / 180, -15 * Math.PI/180);
			}
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
	var vx = this.pBody.vX, vy = this.pBody.vY;
	this.speed = Math.sqrt(vx*vx + vy*vy);
	if (this.speed > this.topSpeed)
		this.topSpeed = this.speed;

	switch (this.state) {
		case JumperState.WAITING:
			break;
		case JumperState.SLIDING:

			if (this.pBody.x > ramp.chargePoint)
				$("#hint").innerHTML = "Hold to charge jump";

			if (this.pBody.x > 1) {
				this.changeState(JumperState.FLYING);
			}
			break;
		case JumperState.JUMPING:
			$("#hint").innerHTML = "Release to jump!";
			this.charge = (this.charge + (80 * dt)) % 100;
			$("#power-bar").style.width = Math.round(this.charge) + "%";

			if (this.pBody.x > 1) {
				this.changeState(JumperState.FLYING);
			}
			break;
		case JumperState.FLYING:
			this.physics();
			$("#power-container").style.display = "none";
			// Round to nearest 0.5m like in real ski jumping
			var d = Number(Math.round((ramp.getJumpedDistance(this.pBody.x)*2))/2).toFixed(1);
			// Jumper angle control, angles are both negative
			if (this.landingStart == 0 && this.jumperAngle > this.jumperTargetAngle)
			{
				this.jumperAngle += Params.Jumper.angVelToFlyPosition * dt;
			}
			else if (this.landingStart > 0 && this.jumperAngle < this.jumperTargetAngle)
			{
				// TODO: Speed should be determined so that player best landing
				// points would be received when jumper has just reached landing
				// position when he hits the ground.
				this.jumperAngle += Params.Jumper.angVelToLandingPosition * dt;
			}

			// Prevent clipping of skis with the hill
			var skiEndX = this.pBody.x - this.skiLength * 0.5;
			var hillYAngleAtSkiEnd = ramp.getYandAngle(skiEndX);

			if (this.stateTime > 0.1 && this.pBody.y < hillYAngleAtSkiEnd.y) {
				var clipAmount = hillYAngleAtSkiEnd.y - this.pBody.y;
				var angleToRotate = Math.atan(clipAmount/(0.5*this.skiLength));
				this.pBody.theta = -angleToRotate;
			}

			$("#hint").innerHTML = d > 0 ? (d + " m") : "";
			if (this.stateTime > 0.1 && this.isOnRamp()) {
				records.add(d);
				$("#topspeed").innerHTML = Math.round(jumper.topSpeed * 3.6) + " km/h";

				// Time from initiating landing until hitting the slope
				var landingTime = this.stateTime - this.landingStart;
				var optimalLandingTime = 0.150; // TODO: Magic number, should be moved to parameter struct
				if (this.landingStart > 0 && landingTime > 0.050) {
					console.log("Landing time: " + landingTime);
					this.landingPoints = 20 - Math.abs(optimalLandingTime - landingTime) * 50;
					this.landingPoints = THREE.Math.clamp(this.landingPoints,4,20);
					this.angleAtLanding = this.pBody.theta;
					console.log('Angle at landing: ' + this.angleAtLanding);
					this.minAngleAfterLanding = this.angleAtLanding;
					this.maxAngleAfterLanding = this.angleAtLanding;

					if (this.landingPoints == 4) {
						this.jumperAngle = -Math.PI/2;
					} else {
						this.jumperAngle = Params.Jumper.landingTargetAngle
					}
				} else {
					// If jump has not been started at all
					this.jumperAngle = -Math.PI/2;
					this.landingPoints = 4;
				}

				$("#comments").innerHTML = commentStr;
				this.changeState(JumperState.LANDING);
			}
			break;
		case JumperState.LANDING:

			if (this.stateTime > 1.5) {
				$("#hint").innerHTML = "";

				$("#points").innerHTML = Math.round(this.landingPoints);
				$("#results").style.display = "block";
				this.changeState(JumperState.LANDED);
			}

			// Monitor jumper angle for 1 second after landing for sommersaults etc
			if (this.stateTime < 1.0) {
				if (this.minAngleAfterLanding > this.pBody.theta) {
					this.minAngleAfterLanding = this.pBody.theta;
				}
				if (this.maxAngleAfterLanding < this.pBody.theta) {
					this.maxAngleAfterLanding = this.pBody.theta;
				}
			} else {

				if (this.maxAngleAfterLanding > 0)
					this.landingPoints = 4;

				if (this.minAngleAfterLanding < (-55*Math.PI/180.0) )
					this.landingPoints = 4;

				var commentStr = '';

				if (this.landingPoints == 20) {
					commentStr = 'Awesome landing!';
				} else if (this.landingPoints > 18) {
					commentStr = 'Great landing!';
				} else if (this.landingPoints > 15) {
					commentStr = 'Getting there.';
				} else if (this.landingPoints > 10) {
					commentStr = 'Some more practice needed...';
				} else {
					commentStr = 'Maybe you should try something else than skijumping.';
				}

				$("#comments").innerHTML = commentStr;
			}
			break;
		case JumperState.LANDED:
			this.pBody.friction = 0.8;
			break;
		default:
			throw "Unknown state " + this.state;
	}
	this.visual.position.x = this.pBody.x;
	this.visual.position.y = this.pBody.y;
	this.visual.rotation.z = this.pBody.theta;
	this.visual.children[1].rotation.z = this.jumperAngle;
}

Jumper.prototype.isOnRamp = function() {
	return this.pBody.onRamp();
};

Jumper.prototype.physics = function() {
	// Jumper airspeed
	// TODO: putting velocities to zero here seems to give quite nice results - tuning needed !??
	var vX = this.pBody.vX + wind.magnitude;
	var vY = this.pBody.vY;

	// Square of velocity
	var vSqr = vX*vX; // + vY*vY TODO: fix

	// Air density [kg/m^3]
	var rho = 1.315

	var liftForce = 0;
	var dragForce = 0;

	switch (this.physicsMode)
	{
		case PhysicsMode.PARAMETRIC:
			// Various angles (in degrees)
			var beta = 9.5 * Math.PI/180; // Body-to-ski
			var gamma = 160 * Math.PI/180; // Hip angle
			var alpha = (Math.PI/2 - (-this.jumperAngle))*180/Math.PI; //35.5; // Angle of attack, this should be calculated based on jumper orientation and airspeed
			// These numbers are valid for constant beta and gamma
			var L = -0.43903 + 0.060743*alpha - 7.192e-4*alpha*alpha
			var D = -0.032061 + 0.01232*alpha + 2.283e-4*alpha*alpha
			//var L_b = -0.645718+0.0126185*beta-3.348e-4*beta*beta;
			//var D_b = 0.408435 + 0.012364*beta+3.9308e-5*beta*beta;

			liftForce = rho/2*L*vSqr;
			dragForce = rho/2*D*vSqr;
		break;

		case PhysicsMode.SIMPLE_LIFTDRAG:
			// Lift and drag coefficients
			var cD = 0.25;
			var cL = 0.5;

			var alpha = 20; //(Math.PI/2 - (-this.jumperAngle))*180/Math.PI; //35.5; // Angle of attack, this should be calculated based on jumper orientation and airspeed

			// Area projections (0.5 approx width of jumper) against the flow
			var aX = 0.5*Math.cos(alpha)*this.skiLength;
			var aY = 0.5*Math.sin(alpha)*this.skiLength;

			// Drag force x and y components
			var dX = 0.5*rho*cD*aX*vX*vX;
			var dY = 0; //0.5*rho*cD*aY*vY*vY;
			// Lift (only y)
			var lY = 0.5*rho*cL*aX*vX*vX;

			if (vX > 0) dX *= -1;
			if (vY > 0) dY *= -1;
			liftForce = lY + dY;
			dragForce = dX;
		break;

		default:
			throw "Unknown physics mode " + this.physicsMode
		break;

	}

	this.forces = [-dragForce, -liftForce];
	this.pBody.applyForce(dragForce, liftForce);
};