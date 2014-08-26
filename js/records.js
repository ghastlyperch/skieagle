
function Records(profileId) {
	this.profile = Records.PROFILE_PREFIX + profileId;
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
	var loaded = localStorage[this.profile];
	if (loaded) {
		this.records = JSON.parse(loaded);
		var time = Date.now();
		// TODO: Reset at midnight instead of 24h after last record
		if (time - this.records.daily.time > 86400000) // One day in ms
			this.records.daily.distance = 0;
		console.log("Records loaded");
	} else console.log("No previous records found");
}

Records.prototype.add = function(distance) {
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
}

Records.prototype.save = function() {
	localStorage[this.profile] = JSON.stringify(this.records);
}

Records.PROFILE_PREFIX = "records_profile_";
