Template.car.rendered = function() {
	//console.log(this.data);
	var car = Cars.findOne(this.data);
	console.log(car)
	// $('#'+this.data).html(JSON.stringify(car));

	if(car.current == 'NW' && car.direction == 'NE' || car.current == 'NE' && car.direction == 'SE' || car.current == 'SE' && car.direction == 'SW' || car.current == 'SW' && car.direction == 'NW'){
		car.direction = '&lt;';
	}
}