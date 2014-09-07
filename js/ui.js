
function initUI() {
	$("#settings-icon").addEventListener("click", function(e) {
		e.preventDefault();
		var elem = $("#settings");
		elem.style.display = (elem.style.display != "none" ? "none" : "block");
	}, true);

	$("#reset-records").addEventListener("click", function(e) {
		e.preventDefault();
		if (confirm("Are you sure you want to erase all records?")) {
			records.reset();
			records.save();
		}
	}, true);
}
