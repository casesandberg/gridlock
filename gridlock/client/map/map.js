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
	'dragstart .car': function(){
		destination = $(this).attr('data-destination');
		current = $(this).attr('data-current');
		alertify.log();

		// move.start($(this), destination);
	},
	'drag .car': function(event){
		move.ghost($(this), current, event);
	},
	'dragend .car': function(){
		move.done();
	},
	'mouseenter .active': function(){
		move.success(destination);
	}
});

var car = $('.car');
var gate = $('.street-gate');

var move = {
	start: function(_this, destination){
		_this.closest('.street-queue').append(_this.clone().addClass('ghost'));
		$('.' + destination.toLowerCase() + '-street').find(gate).addClass('active');
	},
	ghost: function(_this, current, event){
		Math.radians = function(degrees) {
			return degrees * Math.PI / 180;
		};

		var top = _this.offset().top - event.clientY ;
		var left = -((_this.offset().left - event.clientX) + 20);

		if(current == 'SW'){
			$('.ghost').css({
				'left': -1*(top * Math.cos(Math.radians(-45)) + left * Math.sin(Math.radians(-45))),
				'top': -1*(left + Math.cos(Math.radians(-45)) - top * Math.sin(Math.radians(-45))),
				// '-webkit-transform': 'rotate(' + ((_this.offset().left - event.clientX) / (_this.offset().top - event.clientY + 40) ) * -100 + 'deg)'
			})
		}

		if(current == 'NW'){
			$('.ghost').css({
				'left': -1*(top * Math.cos(Math.radians(45)) + left * Math.sin(Math.radians(45))),
				'top': -1*(left + Math.cos(Math.radians(45)) - top * Math.sin(Math.radians(45))),
			})
		}

		if(current == 'NE'){
			$('.ghost').css({
				'top': 1*(top * Math.cos(Math.radians(45)) + left * Math.sin(Math.radians(45))),
				'left': -1*(left + Math.cos(Math.radians(45)) - top * Math.sin(Math.radians(45))),
			})
		}

		if(current == 'SE'){
			$('.ghost').css({
				'left': 1*(top * Math.cos(Math.radians(45)) + left * Math.sin(Math.radians(45))),
				'top': 1*(left + Math.cos(Math.radians(45)) - top * Math.sin(Math.radians(45))),
			})
		}
	},
	success: function(destination){
		$('.ghost').remove();
		alertify.success();

		if(destination == 'NE'){
			$('.car').addClass('move-up');
		};

		gate.unbind('mouseenter');
	},
	done: function(){
		$('.ghost').remove();
		gate.removeClass('active');

		car.unbind('dragend drag');
		gate.unbind('mouseenter');
	}
}