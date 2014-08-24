
function Controller(obj) {
	this.object = obj;
	var pressed = [];

	function onKeyDown(event) {
		pressed[event.keyCode] = true;
		if (pressed[17] || pressed[18]) // CTRL/ALT for browser hotkeys
			return;
		if (event.keyCode >= 112 && event.keyCode <= 123) // F1-F12
			return;

		if (event.keyCode == 32)
			obj.jump();

		event.preventDefault();
	}

	function onKeyUp(event) {
		pressed[event.keyCode] = false;
		event.preventDefault();
	}

	document.addEventListener('keydown', onKeyDown, true);
	document.addEventListener('keyup', onKeyUp, true);
};
