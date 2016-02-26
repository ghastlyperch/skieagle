function PhysicsObject(mass, x0, y0, fisslope) {
	this.mass = mass;
	this.x = fisslope.startingPosition[0];
	this.y = fisslope.startingPosition[1];
	
	this.vX = 0;
	this.vY = 0;
	
	this.aX = 0;
	this.aY = 0;
	
	this.fX = 0;
	this.fY = 0;
	
	this.torque = 0;
	this.w = 0;
	this.theta = 0;
	
	this.slope = fisslope;
	this.gravity = -9.81;
	
	this.active = false;
	this.isOnRamp = false;
}

PhysicsObject.prototype.applyForce = function(fx, fy) {
	this.fX += fx;
	this.fY += fy;
}

PhysicsObject.prototype.resetForce = function() {
	this.fX = 0;
	this.fY = 0;
}

PhysicsObject.prototype.wakeUp = function() {
	this.active = true;
}

PhysicsObject.prototype.sleep = function() {
	this.active = false;
}

PhysicsObject.prototype.onRamp = function() {
	return this.isOnRamp;
}


PhysicsObject.prototype.step = function(dt) {
	
	if (this.active)
	{
		var syt = this.slope.getYandAngle(this.x);
		
		var fXLoc = 0;
		var fYLoc = 0;
		
		fXLoc = -this.gravity * this.mass * Math.sin(-syt.angle);
		fYLoc = this.gravity * this.mass * Math.cos(-syt.angle);
		
		if (this.vX > 0 && this.isOnRamp)
			fXLoc -= -fYLoc * this.slope.getFriction();
		
		if (this.y <= syt.y) {
			fYLoc = 0;
		}
		
		this.fX += fXLoc * Math.cos(syt.angle) - fYLoc * Math.sin(syt.angle);
		this.fY += fXLoc * Math.sin(syt.angle) + fYLoc * Math.cos(syt.angle);;
		
		this.aX = this.fX / this.mass;
		this.aY = this.fY / this.mass;
		
		this.vX += this.aX * dt;
		this.vY += this.aY * dt;
		
		this.x += this.vX * dt;
		this.y += this.vY * dt;
		
		syt = this.slope.getYandAngle(this.x);
		if (this.y <= syt.y) {
			this.y = syt.y;
			this.isOnRamp = true;
			this.theta = syt.angle
		} else {
			this.isOnRamp = false;
			
		}
		
		// Reset forces so new ones can be applied in next step
		this.resetForce();
	}
}
