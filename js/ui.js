
function initUI(showMainMenu) {
	var hills = [];
	for (var hill in Params.Slopes) {
		if (Params.Slopes.hasOwnProperty(hill)) {
			Params.Slopes[hill].id = hill;
			if (hill.startsWith("HS"))
				hills.push(Params.Slopes[hill]);
		}
	}
	hills.sort(function(a, b) { return a - b; });
	for (var i = 0; i < 4; i++) {
		$("#select-hill-" + (i+1)).innerHTML = hills[i].name + "<br/>" + hills[i].city + " HS" + hills[i].HS;
		$("#select-hill-" + (i+1)).href = "?" + hills[i].id;
		$("#records-hill-" + (i+1)).innerHTML = hills[i].name;
		$("#records-hill-" + (i+1)).href = "#records-" + hills[i].id;
	}

	$("#fullscreen-icon").addEventListener("click", toggleFullscreen, true);

	$("#reset-records").addEventListener("click", function(e) {
		e.preventDefault();
		if (confirm("Are you sure you want to erase all records?")) {
			records.reset();
			records.save();
		}
	}, true);

	if (!CAPS.touch) {
		[].forEach.call(document.querySelectorAll(".btn"), function(elem) {
			elem.classList.add("btn-no-touch");
		});
	}

	function hideAllMenus() {
		var divs = document.querySelectorAll(".menu");
		for (var i = 0; i < divs.length; ++i)
			divs[i].style.display = "none";
	}

	function hideMenu() {
		hideAllMenus();
		$("#menu-container").style.display = "none";
		$("#hint").style.display = "block";
	}

	function handleHash() {
		var hash = window.location.hash;
		if (hash.length < 2 || hash.contains("#debug"))
			return;
		hideAllMenus();
		if (hash.startsWith("#records-")) {
			console.log(hill);
			var hill = hash.substr(9);
			var rec = new Records(hill);
			$("#hillname").innerHTML = Params.Slopes[hill].name;
			$("#dailyrecord").innerHTML = rec.records.daily.distance + " m";
			$("#alltimerecord").innerHTML = rec.records.allTime.distance + " m";
			$("#menu-hillrecords").style.display = "block";
		} else {
			var menudiv = $("#menu-" + hash.substr(1));
			if (menudiv) menudiv.style.display = "block";
			else $("#menu-main").style.display = "block";
		}
	}

	window.addEventListener("hashchange", handleHash, true);

	if (!showMainMenu || DEBUG) {
		hideMenu();
	} else {
		if (window.location.hash.length < 2)
			$("#menu-main").style.display = "block";
		else handleHash();
	}
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
