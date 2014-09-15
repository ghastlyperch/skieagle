
function Wind() {
	this.MAX_WINDSPEED = 3;
	this.magnitude = Math.random() * 2 * this.MAX_WINDSPEED - this.MAX_WINDSPEED;
	this.heading = 0; // Not used in initial implementation, wind has only two directions (head or tail)s
};

Wind.prototype.reset = function() {
	this.magnitude = Math.random() * 2 * this.MAX_WINDSPEED - this.MAX_WINDSPEED;
};

Wind.prototype.update = function() {
	// Initial implementation, no dynamics !
};
