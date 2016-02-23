
function initUI() {
	$("#fullscreen-icon").addEventListener("click", toggleFullscreen, true);

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

	function hideAllMenus() {
		var divs = document.querySelectorAll(".menu");
		for (var i = 0; i < divs.length; ++i)
			divs[i].style.display = "none";
	}

	function startGame() {
		hideAllMenus();
		$("#menu-container").style.display = "none";
		$("#hint").style.display = "block";
	}

	$("#btn-newgame").addEventListener("click", function(e) {
		startGame();
	}, true);

	$("#btn-instructions").addEventListener("click", function(e) {
		hideAllMenus();
		$("#menu-instructions").style.display = "block";
	}, true);

	$("#btn-records").addEventListener("click", function(e) {
		hideAllMenus();
		$("#menu-records").style.display = "block";
	}, true);

	var backs = document.querySelectorAll(".btn-back");
	for (var i = 0; i < backs.length; ++i) {
		backs[i].addEventListener("click", function(e) {
			hideAllMenus();
			$("#menu-main").style.display = "block";
		}, true);
	}

	$("#menu-main").style.display = "block";

	if (DEBUG)
		startGame();
}

function toggleFullscreen() {
	if (!document.fullscreenElement && !document.mozFullScreenElement &&
		!document.webkitFullscreenElement && !document.msFullscreenElement)
	{
		var d = document.documentElement;
		if (d.requestFullscreen) d.requestFullscreen();
		else if (d.msRequestFullscreen) d.msRequestFullscreen();
		else if (d.mozRequestFullScreen) d.mozRequestFullScreen();
		else if (d.webkitRequestFullscreen) d.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
	} else {
		if (document.exitFullscreen) document.exitFullscreen();
		else if (document.msExitFullscreen) document.msExitFullscreen();
		else if (document.mozCancelFullScreen) document.mozCancelFullScreen();
		else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
	}
}
