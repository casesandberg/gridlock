$(function(){

	var rows = 35;
	var columns = 35;
	var grid = util.create2d(rows, columns);
	var map = $('.map');

	// Create li's. To be replaced with handlebar templates
	var square;
	for (var i = 0; i < rows; i++){
		for (var j = 0; j < columns; j++){

			square = $(document.createElement('li')).addClass('square').attr('data-color', util.randomPickFromArray([1, 2, 3, 4, 5])).html('(' + i + ',' + j + ')');
			map.append(square);
			grid[i][j] = square;

		}
	}

	// Sizing. To be replaced with handlebar template style tags
	var squarePercent = $(window).width() / 26;

	map.css('width', squarePercent * columns);

	$('.square').css({
		'width': squarePercent,
		'height': squarePercent
	});

	$('.wrap-map').css({
		'margin-left': (-squarePercent * columns) / 2,
		'margin-top': (-squarePercent * rows) / 2
	});

	// Intersection layout. To be replaced with ASKII map
	var intersection = {
		wide: 7,
		tall: 7,
		startTop: ((rows - 1) / 2) - ((7 - 1) / 2),
		startLeft: ((columns - 1) / 2) - ((7 - 1) / 2),
	}

	for (var i = intersection.startTop; i < intersection.startTop + intersection.tall; i++){
		for (var j = intersection.startLeft; j < intersection.startLeft + intersection.wide; j++){
			grid[i][j].addClass('center');
		}
	}

	// Car

	var move = {
		start: function(destination, event){
			$('.wrap-map').append($('.car').clone().addClass('ghost'));
			if(destination == 'NE'){
				grid[13][18].addClass('gate-square');
				grid[13][19].addClass('gate-square');
				grid[13][20].addClass('gate-square');
			}
		},
		ghost: function(event){
			var car = $('.car');
			$('.ghost').css({
				'left': event.clientX + 165,
				'top': event.clientY + 290 + 30,
				'-webkit-transform': 'rotate(' + ((car.offset().left - event.clientX) / (car.offset().top - event.clientY + 40) ) * -100 + 'deg)'
			})
			$('.ghost div').css({
				'-webkit-transform': 'rotate(' + ((car.offset().left - event.clientX) / (car.offset().top - event.clientY + 40) ) * 100 + 'deg)'
			});
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

	var car = $(document.createElement('div')).addClass('car').css({
		'left': grid[21][19].offset().left - map.offset().left,
		'top': grid[21][19].offset().top - map.offset().top
	}).attr('data-destination', 'NE');

	$('.wrap-map').append(car);
	$('.car').append($(document.createElement('div')).html('^'));

	var destination;

	$('.car').bind('dragstart', function(){
		destination = $(this).attr('data-destination');
		move.start(destination);
	});

	$('.car').bind('dragend', function(){
		move.unfinished();
	});

	$('.car').bind('drag', function(event){
		move.ghost(event);
	});

	$('.map').delegate('.gate-square', 'mouseenter', function(){
		move.success(destination);
	});

});