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