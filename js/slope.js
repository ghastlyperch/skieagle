
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
	world.addBody(this.shape);

	// Visual representation
	var points = [];
	for (var i = 0; i < slopeProfile.length; ++i) {
		points.push(i * this.elementWidth); // x-coordinate
		points.push(slopeProfile[i]);
	}
	//this.visual = new PIXI.Polygon(points);
	//this.visual.scale.y = -1;
	//scene.addChild(this.visual);
}
