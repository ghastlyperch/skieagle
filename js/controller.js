
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
	var touchStart = [0, 0];
	var touchDelta = [0, 0];

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
		e.preventDefault();
		pressed[e.keyCode] = false;
	}

	function onClick(e) {
		e.preventDefault();
		obj.action();
	}

	// Can't prevent default in touchstart/end as click events won't then go through
	function onTouchStart(e) {
		touchStart[0] = e.changedTouches[0].screenX;
		touchStart[1] = e.changedTouches[0].screenY;
	}

	function onTouchMove(e) {
		e.preventDefault();
		var x = e.changedTouches[0].screenX;
		var y = e.changedTouches[0].screenY;
		touchDelta[0] = x - touchStart[0];
		touchDelta[1] = y - touchStart[1];
		touchStart[0] = x;
		touchStart[1] = y;
	}

	function onTouchEnd(e) {
		touchDelta[0] = 0;
		touchDelta[1] = 0;
	}

	function onDeviceMotion(e) {
		if (e.interval > 0)
			self.motionDebug = "Device rot rate: " +
				Number(e.rotationRate.alpha).toFixed(2) + ", " +
				Number(e.rotationRate.beta).toFixed(2) + ", " +
				Number(e.rotationRate.gamma).toFixed(2) + " (" + e.interval + " ms)";
	}

	this.poll = function(dt) {
		var steer = 0;
		if (pressed[39] || pressed[69]) steer += 1; // Right or E
		if (pressed[37] || pressed[81]) steer -= 1; // Left or Q

		steer += THREE.Math.clamp(touchDelta[1], -1, 1);

		if (navigator.getGamepads) {
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
		}

		timeScale = pressed[83] ? 4 : 1; // Debug fast-forward

		if (steer != 0) obj.steer(THREE.Math.clamp(steer, -1, 1) * dt);
	};

	document.addEventListener('keydown', onKeyDown, true);
	document.addEventListener('keyup', onKeyUp, true);
	document.addEventListener('click', onClick, true);
	document.addEventListener('touchstart', onTouchStart, true);
	document.addEventListener('touchmove', onTouchMove, true);
	document.addEventListener('touchend', onTouchEnd, true);
	window.addEventListener('devicemotion', onDeviceMotion, true);
};
