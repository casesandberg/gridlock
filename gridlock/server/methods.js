var util = {};
util.styleCount = 5;
util.directionCount = 4;
util.randomDirection = function () {
  var dir = Math.floor(Math.random()*util.directionCount);
  switch(dir) {
    case 0:
      return "nw";
    case 1:
      return "ne";
    case 2:
      return "se";
    case 3:
      return "sw";
    default:
      return "nw";
  };
};


Meteor.methods({
  pullCar: function(carId) {
    //put in moving array from inside road
    
    var intersection = Intersections.findOne({
      $or: [
        {"roads.ne.queue": carId}, 
        {"roads.nw.queue": carId}, 
        {"roads.sw.queue": carId}, 
        {"roads.se.queue": carId}
      ]
    });
    console.log(carId, intersection);
    var id = intersection._id;
    var moving = intersection.moving;
    Intersections.update({_id: id}, {$push: {moving: carId}});
    _.forEach(intersection.roads, function(val, key) {
      console.log("key: ", key, "val: ", val)
      for (var i = 0; i < val.queue.length; i++) {
        if(val.queue[i] === carId) {
          //found the car in road!!!
          console.log("FOUND", val.queue[i], key);
          var quadrant = key;
          var doingSet = {};
          doingSet["roads." + quadrant + ".queue"] = carId;
          Intersections.update({_id: id}, {$pull: doingSet});
        }
      };
    });

    
  },
  sendCar: function(carId) {

    //find car in intersection and yank it out.
    //send to a new intersection
    //
    //look up which intersection to go to. I'm sending to a 'road' that is the 'direction' (ex: "NW"), then look at the cars current intersection for the matching 'direction' road. Then that roads 'connectionId' is where we send the car to. Map 'direction' to its adjacent road dorection, and add the car to that point in the connecting intersection.
    //remove from 'moving'
    //
    //delete old car.
    //put car in correct intersection in correct quadrent.
    //give car a new direction.
    var car = Cars.findOne({_id: carId});
    var intersection = Intersections.findOne({moving: carId});
    console.log(car, intersection)
    var id = intersection._id;
    var moving = intersection.moving;

    //found car in intersection in moving
    
    //remove car from 'moving'
    Intersections.update({_id: id}, {$pull: {moving: carId}});
    //note direction equivalent
    //NW -> SE
    //SE -> NW
    //NE -> SW
    //SW -> NE
    //find this by looking at the intersection. the direction is the  
    var connectionId = intersection.roads[car.direction].connectionId;

    //If we are sending car off the board, remove car document
    if (connectionId === null) {
      //removing car from board
      console.log("Removing car! coming from: ", intersection._id)
      Cars.remove({_id: carId});
    } else {
      console.log("Moving Car! coming from: ", intersection._id, "going to: ", connectionId)
      var quadrant = "";
      switch(car.direction) {
        case "nw":
          quadrant = "se";
        case "ne":
          quadrant = "sw";
        case "sw":
          quadrant = "ne";
        case "se":
          quadrant = "nw";
        default:
          quadrant = "_temp";
      };

      //add car to the road it is supposed to move to.
      var doingSet = {};
      doingSet["roads." + quadrant + ".queue"] = carId;
      Intersections.update({_id: connectionId}, {$addToSet: doingSet});
      var connectingInter = Intersections.findOne({_id: connectionId});
      console.log(carId, "connetionId: ", connectionId, "connectingInter: ", connectingInter);

      //change car direction after send
      Cars.update({_id: carId},{$set: {direction: util.randomDirection()}});
    }
  },
  assignIntersection: function(user) {

  },
  createAndInsertCar: function (intersectionId, quadrant) {
    chooseSkin = function () { 
      return Math.floor(Math.random()*util.styleCount);
    };
    var car = {
      history: [intersectionId],
      direction: util.randomDirection(),
      skin: chooseSkin()
    };
    var carId = Cars.insert(car);
    var doingSet = {};
    doingSet["roads." + quadrant + ".queue"] = carId;
    Intersections.update({_id: intersectionId}, {
      $addToSet: doingSet
    });
  },

  spawnCars: function (maxCars, types) {
    // see how many cars are in the system
    var currentCount = Cars.find().count();
    var tryCount = 0;
    randomRoad = function (intersection, types) {
      var direction = util.randomDirection();
      if(_.contains(types, intersection.roads[direction].type)) {
        return direction;
      };
      tryCount++;
      if(tryCount > 5) {
        randomRoad(intersection, types);
      }
      else {return null;};
    };
    // add cars to specified roadtypes until the number reaches maxCars
    for(var i = currentCount; i < maxCars; i++) {
      edgeIntersections = Intersections.find({$or: [{"roads.nw.type": {$in: types}}, {"roads.ne.type": {$in: types}}, {"roads.se.type": {$in: types}}, {"roads.sw.type": {$in: types}}]}).fetch()
      randomIntersection = edgeIntersections[Math.floor(Math.random()*edgeIntersections.length)]
      var road = randomRoad(randomIntersection, types) 
      if(!!road) {
        Meteor.call("createAndInsertCar", randomIntersection._id, road);
      }
      else {maxCars++;};
    };
  },




  testAddCar: function(){
    var dest = Math.floor((Math.random() * 4) + 1);
    var destCompass = ["NW", "SW", "SE", "NE"];
    var sk = Math.floor((Math.random() * 5) + 1);
    Cars.insert({
      direction: destCompass[dest - 1],
      history: ["_temp"],
      skin: sk - 1
    });
  },
  testAddIntersections: function() {
    var id1 = Intersections.insert({
      roads: {},
      moving: []
    });
    var id2 = Intersections.insert({
      roads: {},
      moving: []
    });
    var id3 = Intersections.insert({
      roads: {},
      moving: []
    });
    var id4 = Intersections.insert({
      roads: {},
      moving: []
    });

    Intersections.update({_id: id1}, {
      $set: {"roads.ne": {queue: [], connectionId: id2, type: 'player'}}
    });
    Intersections.update({_id: id1}, {
      $set: {"roads.nw": {queue: [], connectionId: null, type: 'edge'}}
    });
    Intersections.update({_id: id1}, {
      $set: {"roads.se": {queue: [], connectionId: id4, type: 'player'}}
    });
    Intersections.update({_id: id1}, {
      $set: {"roads.sw": {queue: [], connectionId: null, type: 'edge'}}
    });
    Intersections.update({_id: id2}, {
      $set: {"roads.ne": {queue: [], connectionId: null, type: 'edge'}}
    });
    Intersections.update({_id: id2}, {
      $set: {"roads.nw": {queue: [], connectionId: null, type: 'edge'}}
    });
    Intersections.update({_id: id2}, {
      $set: {"roads.se": {queue: [], connectionId: id3, type: 'player'}}
    });
    Intersections.update({_id: id2}, {
      $set: {"roads.sw": {queue: [], connectionId: id1, type: 'player'}}
    });
    Intersections.update({_id: id3}, {
      $set: {"roads.ne": {queue: [], connectionId: null, type: 'edge'}}
    });
    Intersections.update({_id: id3}, {
      $set: {"roads.nw": {queue: [], connectionId: id2, type: 'player'}}
    });
    Intersections.update({_id: id3}, {
      $set: {"roads.se": {queue: [], connectionId: null, type: 'edge'}}
    });
    Intersections.update({_id: id3}, {
      $set: {"roads.sw": {queue: [], connectionId: id4, type: 'player'}}
    });
    Intersections.update({_id: id4}, {
      $set: {"roads.ne": {queue: [], connectionId: id3, type: 'player'}}
    });
    Intersections.update({_id: id4}, {
      $set: {"roads.nw": {queue: [], connectionId: id1, type: 'player'}}
    });
    Intersections.update({_id: id4}, {
      $set: {"roads.se": {queue: [], connectionId: null, type: 'edge'}}
    });
    Intersections.update({_id: id4}, {
      $set: {"roads.sw": {queue: [], connectionId: null, type: 'edge'}}
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