Template.car.rendered = function() {
	//console.log(this.data);
	var car = Cars.findOne(this.data);
	console.log(car)
	// $('#'+this.data).html(JSON.stringify(car))
}