Meteor.methods({
  pullCar: function(carId) {
    //put in moving array from inside road
  },
  sendCar: function(carId) {

    //find car in intersection and yank it out.
    //send to a new intersection
    //
    //look up which intersection to go to. I'm sending to a 'road' that is the 'destination' (ex: "NW"), then look at the cars current intersection for the matching 'destination' road. Then that roads 'connectionId' is where we send the car to. Map 'destination' to its adjacent road dorection, and add the car to that point in the connecting intersection.
    //remove from 'moving'
    var car = Cars.findOne({_id: carId});
    var intersections = Intersections.find({}).fetch();

    _.forEach(intersections, function(intersection){
      var id = intersection._id;
      var moving = intersection.moving;
      
      for (var i = 0; i < moving.length; i++) {
        if (moving[i] === carId) {
          //found car in intersection in moving
          
          //remove car from 'moving'
          var Intersections.update({_id: id}, {$pull: {moving: carId}})
          //note destination equivalent
          //NW -> SE
          //SE -> NW
          //NE -> SW
          //SW -> NE
          //find this by looking at the intersection. the destination is the  
          var connectionId = intersection.roads[car.destination].connectionId;
          var connectingInter = Intersections.findOne({_id: connectionId});
          console.log(carId, "connetionId: ", connectionId, "connectingInter: ", connectingInter);
          
          var connectingInter = Intersections.update({_id: connectionId}, {$addToSet: });
        }
      }


    })
    _.findWhere(intersections., {})
    console.log(car)


  },
  testAddCar: function(){
    var dest = Math.floor((Math.random() * 4) + 1);
    var destCompass = ["NW", "SW", "SE", "NE"];
    var sk = Math.floor((Math.random() * 5) + 1);
    Cars.insert({
      destination: destCompass[dest - 1],
      history: ["_temp"],
      skin: sk - 1
    });
  },
  testAddIntersection: function() {
    Intersections.insert({

    });
  },
  testFlushCars: function() {
    Cars.remove({});
  },
  testFlushUsers: function() {
    Meteor.users.remove({});
  },
  testFlushIntersections: function() {
    Intersections.remove({});
  }

});