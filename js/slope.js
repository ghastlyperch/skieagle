
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
	for (var i = 0; i < slopeProfile.length; ++i) {
		var x = i * this.elementWidth;
		var y = slopeProfile[i];
		if (i == 0) visShape.moveTo(x, y);
		else visShape.lineTo(x, y);
	}
	var material = new THREE.MeshBasicMaterial({ color: 0x886622 });
	this.visual = new THREE.Mesh(new THREE.ShapeGeometry(visShape), material);
	scene.add(this.visual);
}
