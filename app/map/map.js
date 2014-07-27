$(function(){

	// Car

	var move = {
		start: function(destination, event){
			// $('.wrap-map').append($('.car').clone().addClass('ghost'));
			if(destination == 'NE'){
				grid[13][18].addClass('gate-square');
				grid[13][19].addClass('gate-square');
				grid[13][20].addClass('gate-square');
			}
		},
		ghost: function(current, event){
			var car = $('.car');
			
			if(current == 'SW'){
				$('.ghost').css({
					'left': event.clientX + 165,
					'top': event.clientY + 290 + 30,
					'-webkit-transform': 'rotate(' + ((car.offset().left - event.clientX) / (car.offset().top - event.clientY + 40) ) * -100 + 'deg)'
				})
				$('.ghost div').css({
					'-webkit-transform': 'rotate(' + ((car.offset().left - event.clientX) / (car.offset().top - event.clientY + 40) ) * 100 + 'deg)'
				});
			}
		},
		success: function(destination){
			alertify.success();
			$('.gate-square').removeClass('gate-square');
			$('.ghost').remove();

			if(destination == 'NE'){
				$('.car').addClass('move-up');
			};
		},
		unfinished: function(){
			$('.gate-square').removeClass('gate-square');
			$('.ghost').remove();
		}
	}

	var destination;
	var current;

	$('.car').bind('dragstart', function(){
		alertify.log();
		destination = $(this).attr('data-destination');
		current = $(this).attr('data-current');
		move.start(destination);
	});

	$('.car').bind('dragend', function(){
		move.unfinished();
	});

	$('.car').bind('drag', function(event){
		move.ghost(current, event);
	});

	$('.map2').delegate('.gate-square', 'mouseenter', function(){
		move.success(destination);
	});

});