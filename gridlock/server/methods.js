Meteor.methods({
  pullCar: function(carId) {
    //put in moving array from inside road
  },
  sendCar: function(carId) {

    //find car in intersection and yank it out.
    //send to a new intersection
    //
    //look up which intersection to go to. I'm sending to a 'road' that is the 'destination', then look at the cars current intersection for the matching 'destination' road. Then that roads 'connectionId' is where we send the car to. Map 'destination' to its adjacent road dorection, and add the car to that point in the connecting intersection.
    //remove from 'moving'
    var car = Cars.findOne({_id: cardId});
    //console.log;


  },
  assignIntersection: function(user) {

  },



  
  createAndInsertCar: function (intersectionId, quadrant) {
    var styleCount = 5;
    var directionCount = 4;
    chooseSkin = function () { 
      return Math.floor(Math.random()*styleCount);
    };
    chooseDirection = function () {
      var dir = Math.floor(Math.random()*directionCount);
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
    var car = {
      history: [intersectionId],
      direction: chooseDirection(),
      skin: chooseSkin()
    };
    var carId = Cars.insert(car);
    var doingSet = {};
    doingSet["roads." + quadrant + ".queue"] = carId;
    Intersections.update({_id: intersectionId}, {
      $addToSet: doingSet
    });
  },

  spawnCars: function (maxCars) {
    // see how many cars are in the system
    // add cars until the number reaces maxCars
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