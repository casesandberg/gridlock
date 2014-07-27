util = {};
util.styleCount = 5;
util.directionCount = 4;
util.carsPerUser = 12;
util.carsPerIntersection = 12;
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
util.masterMatrix = [];
util.newIntersection = function () {
  return {
    roads: {
      nw: {queue: [], connectionId: null, type: 'edge'},
      ne: {queue: [], connectionId: null, type: 'edge'},
      se: {queue: [], connectionId: null, type: 'edge'},
      sw: {queue: [], connectionId: null, type: 'edge'}
    },
    moving: [],
    userId: "none"
  };
};


Meteor.methods({
  gridlocked: function(intersectionId) {
    //move user to new intersection
    //take user off intersection
    //remove the cars from database
    //reset intersection queues
    //reset score
    //spawn appropriate cars
    intersection = Intersections.findOne({_id: intersectionId});
    Meteor.call('assignOrAddIntersection', intersection.userId);
    Cars.remove({$or:[{_id: {$in: intersection.roads.nw.queue}},{_id: {$in: intersection.roads.ne.queue}},{_id: {$in: intersection.roads.sw.queue}},{_id: {$in: intersection.roads.se.queue}}]});
    Intersections.update({_id: intersectionId},{$set: {userId: "none"}});
    Intersections.update({_id: intersectionId},{$set: {"roads.nw.queue": []}});
    Intersections.update({_id: intersectionId},{$set: {"roads.ne.queue": []}});
    Intersections.update({_id: intersectionId},{$set: {"roads.se.queue": []}});
    Intersections.update({_id: intersectionId},{$set: {"roads.sw.queue": []}});
    Intersections.update({_id: intersectionId},{$set: {moving: []}});
    Meteor.users.update({_id: intersection.userId}, {$set: {score: 0}});
  },
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
    //console.log(carId, intersection);
    var id = intersection._id;
    var moving = intersection.moving;
    Intersections.update({_id: id}, {$push: {moving: carId}});
    _.forEach(intersection.roads, function(val, key) {
      //console.log("key: ", key, "val: ", val)
      for (var i = 0; i < val.queue.length; i++) {
        if(val.queue[i] === carId) {
          //found the car in road!!!
          console.log("Pulling: ", val.queue[i], "from road: ", key);
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
    //console.log(car, intersection)
    var id = intersection._id;
    var moving = intersection.moving;

    //give user a point
    Meteor.users.update({intersectionId: id}, {$inc: {score: 1}});

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
      console.log("Moving Car! in dir: ", car.direction, "coming from: ", intersection._id, "going to: ", connectionId)
      var quadrant = "";
      switch(car.direction) {
        case "nw":
          quadrant = "se";
          break;
        case "ne":
          quadrant = "sw";
          break;
        case "sw":
          quadrant = "ne";
          break;
        case "se":
          quadrant = "nw";
          break;
        default:
          quadrant = "_temp";
      };
      //console.log("quadrent: ", quadrant)
      //add car to the road it is supposed to move to.
      var doingSet = {};
      doingSet["roads." + quadrant + ".queue"] = carId;
      //console.log("quadrent: ", quadrant, " doingSet: ", JSON.stringify(doingSet))
      Intersections.update({_id: connectionId}, {$addToSet: doingSet});
      var connectingInter = Intersections.findOne({_id: connectionId});
      //console.log(carId, "connetionId: ", connectionId, "connectingInter: ", connectingInter);

      //change car direction after send
      var newDir = util.randomDirection();
      while(quadrant === newDir) {
        newDir = util.randomDirection();
      }
      Cars.update({_id: carId},{$set: {direction: newDir}});
      Cars.update({_id: carId},{$push: {history: connectionId}});
    }
  },
  addIntersection: function () { //returns intersectionId
    var newIntersection = util.newIntersection();
    return Intersections.insert(newIntersection, function(error, newIntersectionId){
      newIntersection._id = newIntersectionId;
      //if first row length > # rows, then add to beginning of new row
      if(util.masterMatrix[0].length > util.masterMatrix.length) {
        console.log("need a new row");
        var aboveIntersection = _.first(_.last(util.masterMatrix)); //this updates matrix?
        aboveIntersection.roads.sw = {queue: [], connectionId: newIntersection._id, type: "player"}; 
        //update database
        Intersections.update({_id: aboveIntersection._id}, {$set: {"roads.sw": aboveIntersection.roads.sw}});

        newIntersection.roads.ne = {queue: [], connectionId: aboveIntersection._id, type: "player"};
        Intersections.update({_id: newIntersection._id}, {$set: {"roads.ne": newIntersection.roads.ne}}); 

        util.masterMatrix.push([newIntersection]);
      }
      else { //add to shortest row
        console.log("add to shortest row");
        shortRow = _.min(util.masterMatrix, function(row){return row.length});
        rowPos = _.indexOf(util.masterMatrix, shortRow);
        if(rowPos > 0) {
          console.log("shortest row not the top");
          if(util.masterMatrix[rowPos-1].length > shortRow.length) {
            console.log("shortest row has overhang")
            var aboveIntersection = util.masterMatrix[rowPos-1][shortRow.length];
            aboveIntersection.roads.sw = {queue: [], connectionId: newIntersection._id, type: "player"}; 
            Intersections.update({_id: aboveIntersection._id}, {$set: {"roads.sw": aboveIntersection.roads.sw}});
            newIntersection.roads.ne = {queue: [], connectionId: aboveIntersection._id, type: "player"};
            Intersections.update({_id: newIntersection._id}, {$set: {"roads.ne": newIntersection.roads.ne}}); 
          };
        };
        if(shortRow.length > 0) {
          console.log("shortest row has occupants");
          var leftIntersection = _.last(shortRow);
          leftIntersection.roads.se = {queue: [], connectionId: newIntersection._id, type: "player"}; 
          Intersections.update({_id: leftIntersection._id}, {$set: {"roads.se": leftIntersection.roads.se}});
          newIntersection.roads.nw = {queue: [], connectionId: leftIntersection._id, type: "player"};
          Intersections.update({_id: newIntersection._id}, {$set: {"roads.nw": newIntersection.roads.nw}}); 
        };
        shortRow.push(newIntersection);
      };
    });
  },
  assignOrAddIntersection: function (userId) {
    attachUser = function(intersectionId, userId) {
      console.log("giving user " + intersectionId);
      console.log("user " + userId);
      Meteor.users.update({_id: userId}, {$set: {intersectionId: intersectionId}});
      Intersections.update({_id: intersectionId}, {$set: {userId: userId}});
      Meteor.setTimeout(function(){Meteor.call('spawnCars', util.carsPerUser*Meteor.users.find({intersectionId:{$ne: "none"}}).count(), ["edge"])}, 200);
      return intersectionId;
    };
    openIntersection = Intersections.findOne({userId: "none"});
    if(!!openIntersection) {
      return attachUser(openIntersection._id, userId);
    }
    else {
      Meteor.call("addIntersection", function(err, id){
        return attachUser(id, userId);
      });
    };
  },
  createAndInsertCar: function (intersectionId, quadrant) {
    chooseSkin = function () { 
      return Math.floor(Math.random()*util.styleCount);
    };
    var newDir = util.randomDirection();
    while(quadrant === newDir) {
      newDir = util.randomDirection();
    }
    var car = {
      history: [intersectionId],
      direction: newDir,
      skin: chooseSkin()
    };
    var carId = Cars.insert(car);
    var doingSet = {};
    doingSet["roads." + quadrant + ".queue"] = carId;
    Intersections.update({_id: intersectionId}, {
      $addToSet: doingSet
    });
  },

  spawnCars: function (maxCars, types) { //number of cars for system, types of edge to populate
    // see how many cars are in the system
    var currentCount = Cars.find().count();
    var tryCount = 0;
    randomRoad = function (intersection, types) {
      var direction = util.randomDirection();
      console.log(direction);
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
    var doAdd = function(i) {
      Meteor.call("addIntersection", function(err, id){
        console.log(id);
        if(i < 9) {
          Meteor.setTimeout(function(){doAdd(i+1)}, 200);
        };
      });
    };
    doAdd(0);
  },
  testFlushCars: function() {
    Cars.remove({});
  },
  testFlushUsers: function() {
    Meteor.users.remove({});
  },
  testFlushIntersections: function() {
    Intersections.remove({});
  },
  testFlush: function () {
    Meteor.call('testFlushCars');
    Meteor.call('testFlushIntersections');
    Meteor.call('testFlushUsers');
    util.masterMatrix = [[]];
  },
  testMasterMatrix: function () {
    console.log(util.masterMatrix);
  },
  testAddInt: function (intersectionId) {
    Meteor.users.update({_id: Meteor.user()._id}, {$set: {intersectionId: intersectionId}})
  }
  

});