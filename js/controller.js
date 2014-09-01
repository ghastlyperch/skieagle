
if (!!navigator.getGamepads) console.log("Gamepads are supported");
else console.log("No gamepad support");
window.addEventListener("gamepadconnected", function(e) {
	// This event listener is currently needed for Firefox
	console.log("Gamepad connected:", e.gamepad);
});

function Controller(obj) {
	this.object = obj;
	var self = this;
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
		
		if (e.keyCode == 81) // Q
			obj.steer(-0.087); // Approx 5 degrees
		
		if (e.keyCode == 69) // E
			obj.steer(0.087);
			
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

	function onDeviceMotion(e) {
		if (e.interval > 0)
			self.motionDebug = "Device rot rate: " +
				Number(e.rotationRate.alpha).toFixed(2) + ", " +
				Number(e.rotationRate.beta).toFixed(2) + ", " +
				Number(e.rotationRate.gamma).toFixed(2) + " (" + e.interval + " ms)";
	}

	this.poll = function(dt) {
		if (!navigator.getGamepads) return;

		var steer = 0;
		if (pressed[39]) steer += 1;
		if (pressed[37]) steer -= 1;

		var gamepads = navigator.getGamepads();
		for (var i = 0; i < gamepads.length; ++i) {
			var gamepad = gamepads[i];
			if (!gamepad) continue;
			if (gamepad.buttons[0].pressed)
				obj.action();
			var axis = gamepad.axes[0];
			if (Math.abs(axis) > 0.1)
				steer += axis;
		}

		if (steer != 0) obj.steer(steer * dt);
	};

	document.addEventListener('keydown', onKeyDown, true);
	document.addEventListener('keyup', onKeyUp, true);
	document.addEventListener('click', onClick, true);
	window.addEventListener('devicemotion', onDeviceMotion, true);
};
