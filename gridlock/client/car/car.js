Template.car.helpers({
    carName: function() {
      var carId = this.toString();
      var quadrant;
      var car = Cars.findOne({_id: carId});

      var intersection = Intersections.findOne({
          $or: [
              {"roads.ne.queue": carId}, 
              {"roads.nw.queue": carId}, 
              {"roads.sw.queue": carId}, 
              {"roads.se.queue": carId}
          ]
      });
      var id = intersection._id;
      _.forEach(intersection.roads, function(val, key) {
          console.log("key: ", key, "val: ", val)
          for (var i = 0; i < val.queue.length; i++) {
              if(val.queue[i] === carId) {
                  //found the car in road!!!
                  console.log("Found: ", val.queue[i], "in road: ", key);
                  quadrant = key;
                  car.current = quadrant;
              }
          };
      });
      if(car.current == 'nw' && car.direction == 'ne' || car.current == 'ne' && car.direction == 'se' || car.current == 'se' && car.direction == 'sw' || car.current == 'sw' && car.direction == 'nw'){
        car.arrow = '<';
      }

      if(car.current == 'nw' && car.direction == 'sw' || car.current == 'sw' && car.direction == 'se' || car.current == 'se' && car.direction == 'ne' || car.current == 'ne' && car.direction == 'nw'){
        car.arrow = '>';
      }

      if(car.current == 'nw' && car.direction == 'se' || car.current == 'ne' && car.direction == 'sw' || car.current == 'se' && car.direction == 'nw' || car.current == 'sw' && car.direction == 'ne'){
        car.arrow = '^';
      }

      return car;
    }
});