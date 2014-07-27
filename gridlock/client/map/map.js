Template.map.roads = function () {
	if (!!Meteor.user()) {
		var roads =  Intersections.findOne({_id: Meteor.user().intersectionId}).roads
		console.log(roads);

		if (!!roads.nw.connectionId) {
			var nw = Intersections.findOne({_id: roads.nw.connectionId})
		};

	}  
}
Template.map.intersection = function () {
	if (!!Meteor.user()) {
		return Intersections.findOne({_id: Meteor.user().intersectionId})
	}
};
Template.map.moving = function () {
	if (!!Meteor.user()) {
		var moving = Intersections.findOne({_id: Meteor.user().intersectionId}).moving;
		console.log(moving);

		return moving
	}
};

var destination;
var current;

Template.map.events({
	'dragstart .car': function(event){
		destination = $(event.currentTarget).attr('data-destination');
		current = $(event.currentTarget).attr('data-current');

		move.start($(event.currentTarget), destination);
	},
	'drag .car': function(event){
		move.ghost($(event.currentTarget), current, event);
	},
	'dragend .car': function(){
		move.done();
	},
	'mouseover .active': function(){
		move.success(destination);
	},
	'click .active': function(){
		move.success(destination);
	}
});

var car = $('.car');

var move = {
	start: function(_this, destination){
		_this.closest('.street-queue').append(_this.clone().addClass('ghost'));
		$('.' + destination + '-street').find('.street-gate').addClass('active');
	},
	ghost: function(_this, current, event){
		Math.radians = function(degrees) {
			return degrees * Math.PI / 180;
		};
		
		var top = _this.offset().top - event.clientY ;
		var left = -((_this.offset().left - event.clientX) + 20);

		if(current == 'sw'){

			$('.ghost').css({
				'left': -1*(top * Math.cos(Math.radians(-45)) + left * Math.sin(Math.radians(-45))),
				'top': -1*(left + Math.cos(Math.radians(-45)) - top * Math.sin(Math.radians(-45))),
				// '-webkit-transform': 'rotate(' + ((_this.offset().left - event.clientX) / (_this.offset().top - event.clientY + 40) ) + 'deg)'
			});
		}

		if(current == 'nw'){
			$('.ghost').css({
				'left': -1*(top * Math.cos(Math.radians(45)) + left * Math.sin(Math.radians(45))),
				'top': -1*(left + Math.cos(Math.radians(45)) - top * Math.sin(Math.radians(45))),
			});
		}

		if(current == 'ne'){
			$('.ghost').css({
				'top': 1*(top * Math.cos(Math.radians(45)) + left * Math.sin(Math.radians(45))),
				'left': -1*(left + Math.cos(Math.radians(45)) - top * Math.sin(Math.radians(45))),
			});
		}

		if(current == 'se'){
			$('.ghost').css({
				'left': 1*(top * Math.cos(Math.radians(45)) + left * Math.sin(Math.radians(45))),
				'top': 1*(left + Math.cos(Math.radians(45)) - top * Math.sin(Math.radians(45))),
			});
		}
	},
	success: function(destination){
		$('.street-gate').removeClass('active');
		var carId = $('.ghost').attr("data-id");
		Meteor.call('pullCar', carId)
		$('.ghost').remove();
		
		$('.head-points').addClass('add-points');
		Meteor.setTimeout(function(){
			$('.head-points').removeClass('add-points');
		}, 200);

		Meteor.setTimeout(function(){
			Meteor.call('sendCar', carId)
		}, 800);
		
		if(destination == 'NE'){
			$('.car').addClass('move-up');
		};
	},
	done: function(){
		$('.ghost').remove();
		
		Meteor.setTimeout(function(){
			$('.street-gate').removeClass('active');
		}, 600)

		// car.unbind('dragend drag');
	}
}