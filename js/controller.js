
function Controller(obj) {
	this.object = obj;
	var pressed = [];

	function onKeyDown(e) {
		pressed[e.keyCode] = true;
		if (pressed[17] || pressed[18]) // CTRL/ALT for browser hotkeys
			return;
		if (e.keyCode >= 112 && e.keyCode <= 123) // F1-F12
			return;

		if (e.keyCode == 32) // Space
			obj.jump();

		e.preventDefault();
	}

	function onKeyUp(e) {
		pressed[e.keyCode] = false;
		e.preventDefault();
	}

	function onClick(e) {
		obj.jump();
		e.preventDefault();
	}

	document.addEventListener('keydown', onKeyDown, true);
	document.addEventListener('keyup', onKeyUp, true);
	document.addEventListener('click', onClick, true);
};
