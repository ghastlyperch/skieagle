
function Records(profileId) {
	this.profile = Records.PROFILE_PREFIX + profileId;
	this.records = {};
	var loaded = localStorage[this.profile];
	if (loaded) {
		this.records = JSON.parse(loaded);
		var time = Date.now();
		// TODO: Reset at midnight instead of 24h after last record
		if (time - this.records.daily.time > 86400000) // One day in ms
			this.records.daily.distance = 0;
		console.log("Records loaded");
	} else {
		this.reset();
		console.log("No previous records found");
	}
}

Records.prototype.reset = function() {
	this.records = {
		daily: {
			time: 0,
			distance: 0
		},
		allTime: {
			time: 0,
			distance: 0
		}
	};
	console.log("Records reset");
};

Records.prototype.add = function(distance) {
	var dailyDiff = Number(distance - this.records.daily.distance).toFixed(1);
	var allTimeDiff = Number(distance - this.records.allTime.distance).toFixed(1);
	var time = Date.now();
	if (distance > this.records.daily.distance) {
		this.records.daily.distance = distance;
		this.records.daily.time = time;
	}
	if (distance > this.records.allTime.distance) {
		this.records.allTime.distance = distance;
		this.records.allTime.time = time;
	}
	this.save();
	$("#result").innerHTML = distance + " m";
	$("#dailyresult").innerHTML = this.records.daily.distance + " m";
	$("#alltimeresult").innerHTML = this.records.allTime.distance + " m";
	$("#dailydiff").innerHTML = (dailyDiff >= 0 ? "+" : "") + dailyDiff + " m";
	$("#alltimediff").innerHTML = (allTimeDiff >= 0 ? "+" : "") + allTimeDiff + " m";
}

Records.prototype.save = function() {
	localStorage[this.profile] = JSON.stringify(this.records);
}

Records.PROFILE_PREFIX = "records_profile_";
