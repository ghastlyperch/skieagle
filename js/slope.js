
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
	var gamma = 32; // Inclination of the inrun slope
	var alpha = 5; // Take-off table inclination
	var t = 10; // Length of the take-off table
	var r1 = 10; // Curve radius for take-off slope transition end point
	
	var e1 = 92.3 - 1.517*gamma + 0.426*HS // Highest starting point
	var e2 = 67.3 - 0.944*gamma + 0.331*HS // Lowest starting point
	
	var sin_ga = Math.sin(degToRad*(gamma-alpha));
	var cos_ga = Math.cos(degToRad*(gamma-alpha));
	var tan_ga = Math.tan(degToRad*(gamma-alpha));
	
	var d = 2*r1*sin_ga*cos_ga*cos_ga;
	var C = tan_ga/3/(d*d);
	var f = tan_ga*d/3;
	var l = d*(1+0.1*tan_ga*tan_ga);
	
	var E1x = -(t*Math.cos(degToRad*alpha)+f*Math.sin(degToRad*gamma)+d*Math.cos(degToRad*gamma));
	var E1y = t*Math.sin(degToRad*alpha)-f*Math.cos(degToRad*gamma)+d*Math.sin(degToRad*gamma);
	
	var E2x = -t*Math.cos(degToRad*alpha);
	var E2y = t*Math.sin(degToRad*alpha);
	
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
		var P = 1/Math.tan(degToRad*gamma)/3/C;
		var Q = (xCur + t*Math.cos(degToRad*alpha)+f*Math.sin(degToRad*gamma)+d*Math.cos(degToRad*gamma))/2/C/Math.sin(degToRad*gamma);
		
		var ksi = Math.pow((Math.pow((Q*Q+P*P*P),0.5)+Q),0.3333) - Math.pow((Math.pow((Q*Q+P*P*P),0.5)-Q),0.3333);
		var yTran = t*Math.sin(degToRad*alpha)-f*Math.cos(degToRad*gamma)+d*Math.sin(degToRad*gamma)-ksi*Math.sin(degToRad*gamma)+C*ksi*ksi*ksi*Math.cos(degToRad*gamma);
		slopeProfile.push([xCur, yTran]);
		xCur -= xIncr;
	}
	slopeProfile.push([E1x, E1y]); // Start of transition segment
	slopeProfile.push([E1x-(e1-l)*Math.cos(degToRad*gamma),E1y+(e1-l)*Math.sin(degToRad*gamma)]); // Starting position
	slopeProfile.push([E1x-(e1-l)*Math.cos(degToRad*gamma), -40]);
	slopeProfile.push([120, -40]);
	slope.fromPolygon(slopeProfile);
	
	for (var i = 0; i < slope.shapes.length; ++i)
	{
		slope.shapes[i].material = new p2.Material();
	}
	this.body = slope;
	world.addBody(this.body);

	// Visual representation
	var visShape = new THREE.Shape();
	for (var i = 0; i < slopeProfile.length; ++i) {
		var x = slopeProfile[i][0];
		var y = slopeProfile[i][1];
		console.log(x, y);
		if (i == 0) visShape.moveTo(x, y);
		else visShape.lineTo(x, y);
	}
	var material = new THREE.MeshBasicMaterial({ color: 0xcccccc });
	this.visual = new THREE.Mesh(new THREE.ShapeGeometry(visShape), material);
	scene.add(this.visual);

	// Distance measuring function
	this.getJumpedDistance = function(xCoord) { return xCoord; };
}

