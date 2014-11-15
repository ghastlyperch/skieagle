
function FISSlope(world, scene) {
	var degToRad = 0.0174532925;
	var HS = 100; // Hill size
	var w = 0.885*HS+1.5;

	var hn = 0.55 ; // Landing hill height-length ratio (to K point)
	var beta = 45 * degToRad; // Profile angle of inclination (landing hill)
	var v0 = 24.25; // Approx in run speed
	var rho = 1; // Friction angle in deg
	var deltabeta = 2 * degToRad; // Should depend on alpha

	var gamma = 35 * degToRad; // Inclination of the inrun slope
	var alpha = 10.5 * degToRad; // Take-off table inclination
	var t = 0.25*(v0+0.95); //15; // Length of the take-off table
	var r1 = 0.14*(v0+0.95)*(v0+0.95);//10; // Curve radius for take-off slope transition end point

	var e1 = 92.3 - 1.517*gamma + 0.426*HS // Highest starting point
	var e2 = 67.3 - 0.944*gamma + 0.331*HS // Lowest starting point

	var sin_ga = Math.sin(gamma-alpha);
	var cos_ga = Math.cos(gamma-alpha);
	var tan_ga = Math.tan(gamma-alpha);

	var d = 2*r1*sin_ga*cos_ga*cos_ga;
	var C_ir = tan_ga/3/(d*d);
	var f = tan_ga*d/3;
	var l = d*(1+0.1*tan_ga*tan_ga);

	var E1x = -(t*Math.cos(alpha)+f*Math.sin(gamma)+d*Math.cos(gamma));
	var E1y = t*Math.sin(alpha)-f*Math.cos(gamma)+d*Math.sin(gamma);

	var E2x = -t*Math.cos(alpha);
	var E2y = t*Math.sin(alpha);

	// Landing hill calculations

	var h = w*Math.sin(Math.atan(hn))/1.005;
	var n = w*Math.cos(Math.atan(hn))/1.005;

	var vk = 0.68*v0 + 12.44;
	var rl = vk*vk*w/380;
	var betal = beta - 1.4/vk; // FIS standard has here also rad2deg conversion
	var vll = vk - 16/vk - 0.1*rho;
	var betap = beta + deltabeta;
	var beta0 = betap/6;

	var r2Lmin = vll*vll/(18-10*Math.cos(betal));
	var r2L = 0.5*(rl+r2Lmin);
	var r2 = vk*vk/(20*Math.cos(betal) + vk*vk*betal/degToRad/7000 - 12.5);

	var l1 = deltabeta*rl*Math.PI/180;
	var l2 = 1.4*rl/vk;

	var rL = r2L;
	var tau = Math.atan((Math.cos(betal)-Math.sqrt(r2/r2L))/Math.sin(betal));
	var C = 1/(2*r2*Math.pow(Math.cos(tau),3));
	var a = - Math.tan(betal+tau)/2/C;
	var b = - Math.tan(tau)/2/C;

	var lX = n + rl*(Math.sin(beta)-Math.sin(betal));
	var lY = -h - rl*(Math.cos(betal)-Math.cos(beta));

	var uX = lX + C*Math.sin(tau)*(a*a-b*b)+Math.cos(tau)*(b-a);
	var uY = lY - C*Math.cos(tau)*(a*a-b*b)+Math.sin(tau)*(b-a);

	var pX = n - rl*(Math.sin(betap)-Math.sin(beta));
	var pY = -h -rl*(Math.cos(betap)-Math.cos(beta));

	var lOr = 79; // Length of out-run
	var bY = uY-20;

	// Profile generation
	var slopeProfile = [];
	var slope = new p2.Body();

	// Landing hill transition segment
	slopeProfile.push([uX+lOr,bY]);
	slopeProfile.push([uX+lOr,uY]);
	slopeProfile.push([uX, uY]);
	var nIter = 20;
	var xIncr = (uX - lX)/nIter;
	var xCur = uX - xIncr;

	for (var i = 0; i < nIter - 1; ++i)
	{
		var cT = Math.cos(tau);
		var sT = Math.sin(tau);

		var ksi = (cT - Math.sqrt(cT*cT - 4*C*(xCur-lX-C*a*a*sT+a*cT)*sT))/2/C/sT;
		var yTran = lY - C*cT*(a*a-ksi*ksi)-sT*(a-ksi);
		slopeProfile.push([xCur, yTran]);
		xCur -= xIncr;
	}

	// Landing hill knoll
	slopeProfile.push([lX, lY]);
	slopeProfile.push([n, -h]);
	nIter = 30;
	xIncr = n/nIter;
	xCur = n-xIncr;

	var u = -pY - w/40 - pX*Math.tan(beta0);
	var v = pX*(Math.tan(betap)-Math.tan(beta0));

	for (var i = 0; i < nIter -1; ++i)
	{
		var yKnoll = -w/40 - xCur*Math.tan(beta0) - (3*u-v)*Math.pow((xCur/pX),2)+(2*u-v)*Math.pow(xCur/pX,3);
		slopeProfile.push([xCur, yKnoll]);
		xCur -= xIncr
	}
	slopeProfile.push([0, -w/40])
	slopeProfile.push([0, 0]);
	slopeProfile.push([E2x, E2y]); // Start of take-off table

	// Transition segment
	nIter = 20; // Number of sub-segments in transition segment
	xIncr = d/nIter;
	xCur = d-xIncr;
	//console.log("C_ir: " + C_ir + " d: " + d);
	for (var i = 0; i < nIter - 2; ++i)
	{
		var xTwisted = xCur;
		var yTwisted = C_ir*xCur*xCur*xCur;
		var xTransformed = Math.cos(gamma)*xTwisted + Math.sin(gamma)*yTwisted + E1x;
		var yTransformed = -Math.sin(gamma)*xTwisted + Math.cos(gamma)*yTwisted + E1y;

		slopeProfile.push([xTransformed, yTransformed]);
		xCur -= xIncr;
	}
	slopeProfile.push([E1x, E1y]); // Start of transition segment
	var topX = E1x - (e1-l) * Math.cos(gamma);
	var topY = E1y + (e1-l) * Math.sin(gamma);
	var plateau = 6;
	slopeProfile.push([topX, topY]); // Starting position
	slopeProfile.push([topX - plateau, topY]); // Tiny plateau at top
	slopeProfile.push([topX - plateau, bY]); // Left side vertical wall

	nIter = 5;
	xIncr = ((uX + lOr) - (E1x-(e1-l)*Math.cos(gamma)))/nIter;
	xCur = (E1x-(e1-l)*Math.cos(gamma)) + xIncr;

	for (var i = 0; i < nIter - 2;  ++i)
	{
		slopeProfile.push([xCur, bY]);
		xCur += xIncr;
	}

	slope.fromPolygon(slopeProfile);

	for (var i = 0; i < slope.shapes.length; ++i)
	{
		slope.shapes[i].material = new p2.Material();
	}
	this.body = slope;
	world.addBody(this.body);

	// Calculate starting point for jumper and slope extents
	this.startingPosition = [topX + 5, topY - 2];
	this.minX = topX - plateau;
	this.maxX = uX + lOr;
	this.minY = bY;
	this.maxY = this.startingPosition[1];

	// Visual representation
	var visShape = new THREE.Shape();
	for (var i = 0; i < slopeProfile.length; ++i) {
		var x = slopeProfile[i][0];
		var y = slopeProfile[i][1];
		if (i == 0) visShape.moveTo(x, y);
		else visShape.lineTo(x, y);
	}
	var tex = THREE.ImageUtils.loadTexture("assets/snow.png");
	tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
	tex.repeat.set(0.05, 0.05);
	var material = new THREE.MeshBasicMaterial({ color: 0xcccccc, overdraw: 0.75, map: tex });
	this.visual = new THREE.Mesh(new THREE.ShapeGeometry(visShape), material);
	scene.add(this.visual);

	// Distance measuring function
	this.getJumpedDistance = function(xCoord) { return xCoord; };
}


/*
function TestSlope(world, scene) {
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
	var material = new THREE.MeshBasicMaterial({ color: 0xcccccc, overdraw: 1 });
	this.visual = new THREE.Mesh(new THREE.ShapeGeometry(visShape), material);
	scene.add(this.visual);
}*/
