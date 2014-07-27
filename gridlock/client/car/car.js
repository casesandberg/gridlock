Template.car.rendered = function() {
  //console.log(this.data);
  var carId = this.data;
  var quadrant;
  var car = Cars.findOne(this.data);
  console.log(car)
  // $('#'+this.data).html(JSON.stringify(car))
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
    //console.log("key: ", key, "val: ", val)
    for (var i = 0; i < val.queue.length; i++) {
      if(val.queue[i] === carId) {
        //found the car in road!!!
        console.log("Found: ", val.queue[i], "in road: ", key);
        quadrant = key;
        console.log(quadrant);
      }
    };
  });
}