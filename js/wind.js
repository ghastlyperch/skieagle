
function Wind() {
	this.directionChangeTime = 0;
	this.change = 0;
	this.magnitude = 0
	this.heading = 0; // Not used in initial implementation, wind has only two directions (head or tail)s
	this.reset();
};

Wind.prototype.reset = function() {
	this.magnitude = Math.random() * 2 * Params.Wind.maxSpeed - Params.Wind.maxSpeed;
	this.directionChangeTime = 0;
	this.change = 0;
};

Wind.prototype.update = function(dt) {
	this.directionChangeTime -= dt;
	if (this.directionChangeTime <= 0) {
		this.directionChangeTime = Math.random() * 3 + 1;
		this.change = Math.random() * 2 * Params.Wind.maxChangePerSec - Params.Wind.maxChangePerSec;
	}
	this.magnitude += this.change * dt;
	this.magnitude = THREE.Math.clamp(this.magnitude, -Params.Wind.maxSpeed, Params.Wind.maxSpeed);
};
