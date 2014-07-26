$(function(){

	var rows = 35;
	var columns = 35;
	var grid = util.create2d(rows, columns);
	var map = $('.map');

	// Create li's. To be replaced with handlebar templates
	var square;
	for (var i = 0; i < rows; i++){
		for (var j = 0; j < columns; j++){

			square = $(document.createElement('li')).addClass('square').attr('data-color', util.randomPickFromArray([1, 2, 3, 4, 5]));
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

});