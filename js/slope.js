
function Slope(world, scene) {
	this.elementWidth = 2;
	// Physical body
	var slopeProfile = [];
	var xTmp = -1;
	var hMultip = 100;
	for (var i = 0; i < 100; ++i) {
		if (i < 50)
		{
			slopeProfile.push(hMultip*xTmp*xTmp);
			xTmp += 0.02;
		}
		else if (i < 80)
		{
			slopeProfile.push(-(hMultip*xTmp*xTmp + 3));
			xTmp += 0.02
		}
		else
		{
			slopeProfile.push(-hMultip*xTmp*xTmp);
		}
	}
	slopeProfile.push(0);
	slopeProfile.push(0);

	this.shape = new p2.Heightfield(slopeProfile, {
		elementWidth: this.elementWidth
	});
	this.shape.material = new p2.Material();
	this.body = new p2.Body();
	this.body.addShape(this.shape);
	world.addBody(this.body);

	// Visual representation
	var visShape = new THREE.Shape();
	var x, y, minY = 1000;
	for (var i = 0; i < slopeProfile.length; ++i) {
		x = i * this.elementWidth;
		y = slopeProfile[i];
		if (y < minY)
			minY = y;
		if (i == 0) visShape.moveTo(x, y);
		else visShape.lineTo(x, y);
	}
	visShape.lineTo(x, minY - 50);
	visShape.lineTo(0, minY - 50);
	var material = new THREE.MeshBasicMaterial({ color: 0xcccccc });
	this.visual = new THREE.Mesh(new THREE.ShapeGeometry(visShape), material);
	scene.add(this.visual);
}


function FISSlope(world, scene) {
	var degToRad = 0.0174532925;
	var HS = 150; // Hill size
	var w = 0.885*HS+1.5;
	
	var hn = 0.47 ; // Landing hill height-length ratio (to K point)
	var beta = 45 * degToRad; // Profile angle of inclination (landing hill)
	var v0 = 20; // Approx in run speed
	var rho = 1; // Friction angle in deg
	var deltabeta = 2; // Should depend on alpha

	var gamma = 32 * degToRad; // Inclination of the inrun slope
	var alpha = 6 * degToRad; // Take-off table inclination
	var t = 10; // Length of the take-off table
	var r1 = 10; // Curve radius for take-off slope transition end point
	
	var e1 = 92.3 - 1.517*gamma + 0.426*HS // Highest starting point
	var e2 = 67.3 - 0.944*gamma + 0.331*HS // Lowest starting point
	
	var sin_ga = Math.sin(gamma-alpha);
	var cos_ga = Math.cos(gamma-alpha);
	var tan_ga = Math.tan(gamma-alpha);
	
	var d = 2*r1*sin_ga*cos_ga*cos_ga;
	var C = tan_ga/3/(d*d);
	var f = tan_ga*d/3;
	var l = d*(1+0.1*tan_ga*tan_ga);
	
	var E1x = -(t*Math.cos(alpha)+f*Math.sin(gamma)+d*Math.cos(gamma));
	var E1y = t*Math.sin(alpha)-f*Math.cos(gamma)+d*Math.sin(gamma);
	
	var E2x = -t*Math.cos(alpha);
	var E2y = t*Math.sin(alpha);
	
	// Landing hill calculations
	/*
	var h = w*Math.sin(Math.atan(hn))/1.005;
	var n = w*Math.cos(Math.atan(hn))/1.005;
	var vk = 0.68*v0 + 12.44;
	var rl = vk*vk*w/380;
	var betal = beta - 1.4/vk; // FIS standard has here also rad2deg conversion
	var vll = vk - 16/vk - 0.1*rho;
	var betap = beta + deltabeta;
	var beta0 = betap/6;

	var r2Lmin = vll*vll/(18-10*Math.cos(betal);
	
	var r2L = 0.5*(rl+r2lmin);
	var r2 = vk*vk/(20*Math.cos(betal) + vk*vk*betal/degToRad/7000 - 12.5);
	
	var l1 = deltabeta*rl*Math.PI/180;
	var l2 = 1.4*rl/vk;
	*/
	// Profile generation
	var slopeProfile = [];
	var slope = new p2.Body();
	slopeProfile.push([120, 0]);
	slopeProfile.push([100, 0]);
	slopeProfile.push([100, -30]);
	slopeProfile.push([0, -30]);
	slopeProfile.push([0, 0]);
	slopeProfile.push([E2x, E2y]); // Start of take-off table
	
	// Transition segment
	var nIter = 4; // Number of sub-segments in transition segment
	var xIncr = (Math.abs(E1x)-Math.abs(E2x))/nIter;
	var xCur = E2x - xIncr;

	for (var i = 0; i < nIter - 1; ++i) 
	{
		var P = 1/Math.tan(gamma)/3/C;
		var Q = (xCur + t*Math.cos(alpha)+f*Math.sin(gamma)+d*Math.cos(gamma))/2/C/Math.sin(gamma);
		
		var ksi = Math.pow((Math.pow((Q*Q+P*P*P),0.5)+Q),0.3333) - Math.pow((Math.pow((Q*Q+P*P*P),0.5)-Q),0.3333);
		var yTran = t*Math.sin(alpha)-f*Math.cos(gamma)+d*Math.sin(gamma)-ksi*Math.sin(gamma)+C*ksi*ksi*ksi*Math.cos(gamma);
		slopeProfile.push([xCur, yTran]);
		xCur -= xIncr;
	}
	slopeProfile.push([E1x, E1y]); // Start of transition segment
	slopeProfile.push([E1x-(e1-l)*Math.cos(gamma),E1y+(e1-l)*Math.sin(gamma)]); // Starting position
	slopeProfile.push([E1x-(e1-l)*Math.cos(gamma), -40]);
	slopeProfile.push([120, -40]);
	slope.fromPolygon(slopeProfile);
	
	for (var i = 0; i < slope.shapes.length; ++i)
	{
		slope.shapes[i].material = new p2.Material();
	}
	this.body = slope;
	
	// Calculate starting point for jumper
	this.startingPosition = [E1x-(e1-l-1)*Math.cos(gamma), E1y+(e1-l)*Math.sin(gamma)+1];
	world.addBody(this.body);

	// Visual representation
	var visShape = new THREE.Shape();
	for (var i = 0; i < slopeProfile.length; ++i) {
		var x = slopeProfile[i][0];
		var y = slopeProfile[i][1];
		if (i == 0) visShape.moveTo(x, y);
		else visShape.lineTo(x, y);
	}
	var material = new THREE.MeshBasicMaterial({ color: 0xcccccc });
	this.visual = new THREE.Mesh(new THREE.ShapeGeometry(visShape), material);
	scene.add(this.visual);

	// Distance measuring function
	this.getJumpedDistance = function(xCoord) { return xCoord; };
}

