
function Wind() {
	this.MAX_WINDSPEED = 3;
	this.MAX_CHANGE_PER_SEC = 0.3;
	this.directionChangeTime = 0;
	this.change = 0;
	this.magnitude = 0
	this.heading = 0; // Not used in initial implementation, wind has only two directions (head or tail)s
	this.reset();
};

Wind.prototype.reset = function() {
	this.magnitude = Math.random() * 2 * this.MAX_WINDSPEED - this.MAX_WINDSPEED;
	this.directionChangeTime = 0;
	this.change = 0;
};

Wind.prototype.update = function(dt) {
	this.directionChangeTime -= dt;
	if (this.directionChangeTime <= 0) {
		this.directionChangeTime = Math.random() * 3 + 1;
		this.change = Math.random() * 2 * this.MAX_CHANGE_PER_SEC - this.MAX_CHANGE_PER_SEC;
	}
	this.magnitude += this.change * dt;
	this.magnitude = THREE.Math.clamp(this.magnitude, -this.MAX_WINDSPEED, this.MAX_WINDSPEED);
};
