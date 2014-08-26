
if (!!navigator.getGamepads) console.log("Gamepads are supported");
else console.log("No gamepad support");
window.addEventListener("gamepadconnected", function(e) {
	// This event listener is currently needed for Firefox
	console.log("Gamepad connected:", e.gamepad);
});

function Controller(obj) {
	this.object = obj;
	var pressed = [];

	function onKeyDown(e) {
		pressed[e.keyCode] = true;
		if (pressed[17] || pressed[18]) // CTRL/ALT for browser hotkeys
			return;
		if (e.keyCode >= 112 && e.keyCode <= 123) // F1-F12
			return;

		if (e.keyCode == 32 || e.keyCode == 38) // Space / Up
			obj.action();

		if (e.keyCode == 68) // D
			ramp.visual.material = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true });

		e.preventDefault();
	}

	function onKeyUp(e) {
		pressed[e.keyCode] = false;
		e.preventDefault();
	}

	function onClick(e) {
		obj.action();
		e.preventDefault();
	}

	this.poll = function() {
		if (!navigator.getGamepads) return;

		var gamepads = navigator.getGamepads();
		for (var i = 0; i < gamepads.length; ++i) {
			var gamepad = gamepads[i];
			if (!gamepad) continue;
			if (gamepad.buttons[0].pressed)
				obj.action();
		}
	};

	document.addEventListener('keydown', onKeyDown, true);
	document.addEventListener('keyup', onKeyUp, true);
	document.addEventListener('click', onClick, true);
};
