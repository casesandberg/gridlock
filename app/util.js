var util = {

	create2d: function(row, column){
		var array = [];
		for(var i = 0; i < row; i++){
			array[i] = [];

			for(var j = 0; j < column; j++){
				array[i].push(0);
			}
		}
		return array;
	},
	randomPickFromArray: function(array){
		return array[Math.floor(Math.random() * array.length)]
	}
}