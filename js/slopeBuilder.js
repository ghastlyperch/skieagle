function SlopeBuilder()
{

};

SlopeBuilder.prototype.buildSlope = function()
{
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
	
	var slopeShape = new p2.Heightfield(slopeProfile, {
		elementWidth: 2.0
	});
	slopeShape.material = new p2.Material();
	var slope = new p2.Body();
	slope.addShape(slopeShape);
	
	return slope;
};

SlopeBuilder.prototype.buildFISSlope = function()
{
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
	slopeProfile.push([0, 0]);
	slopeProfile.push([E2x, E2y]); // Start of take-off table
	
	var xIncr = 1;
	var xCur = E2x - xIncr;
	var i = 1;
	while (xCur > E1x) 
	{
		var P = 1/Math.tan(degToRad*gamma)/3/C;
		var Q = (xCur + t*Math.cos(degToRad*alpha)+f*Math.sin(degToRad*gamma)+d*Math.cos(degToRad*gamma))/2/C/Math.sin(degToRad*gamma);
		
		var ksi = Math.pow((Math.pow((Q*Q+P*P*P),0.5)+Q),0.3333) - Math.pow((Math.pow((Q*Q+P*P*P),0.5)-Q),0.3333);
		var yTran = t*Math.sin(degToRad*alpha)-f*Math.cos(degToRad*gamma)+d*Math.sin(degToRad*gamma)-ksi*Math.sin(degToRad*gamma)+C*ksi*ksi*ksi*Math.cos(degToRad*gamma);
		slopeProfile.push([xCur, yTran]);
		xCur -= xIncr;
		i++;
	}
		console.log(i);
	slopeProfile.push([E1x, E1y]); // Start of transition segment
	slopeProfile.push([E1x-(e1-l)*Math.cos(degToRad*gamma),E1y+(e1-l)*Math.sin(degToRad*gamma)]); // Starting position
	slopeProfile.push([E1x-(e1-l)*Math.cos(degToRad*gamma), -10]);
	slopeProfile.push([0, -10]);
	slope.fromPolygon(slopeProfile);
	
	slope.shapes[0].material = new p2.Material();	
	return slope;
};