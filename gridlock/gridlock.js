if (Meteor.isClient) {
  Template.neighbors.nw = function () {
    if (!!Meteor.user()) {
      var roads =  Intersections.findOne({_id: Meteor.user().intersectionId}).roads;
      console.log("roads: ", roads);
      var seMerger = null;
      if (!!roads.nw.connectionId) {
        seMerger = Intersections.findOne({_id: roads.nw.connectionId})
        console.log("nw connection found");
      }
      console.log("merger: ", seMerger);
      return seMerger;
    }  
  };
  Template.neighbors.ne = function () {
    if (!!Meteor.user()) {
      var roads =  Intersections.findOne({_id: Meteor.user().intersectionId}).roads;
      console.log("roads: ", roads);
      var swMerger = null;
      if (!!roads.ne.connectionId) {
        swMerger = Intersections.findOne({_id: roads.ne.connectionId})
        console.log("ne connection found")
        neighbors.push(swMerger);
      }
      console.log("merger: ", swMerger);
      return swMerger;
    }  
  };
  Template.neighbors.sw = function () {
    if (!!Meteor.user()) {
      var roads =  Intersections.findOne({_id: Meteor.user().intersectionId}).roads;
      console.log("roads: ", roads);
      var neMerger = null;
      if (!!roads.sw.connectionId) {
        neMerger = Intersections.findOne({_id: roads.sw.connectionId})
        console.log("sw connection found")
      }
      console.log("merger: ", neMerger);
      return neMerger;
    }  
  };
  Template.neighbors.se = function () {
    if (!!Meteor.user()) {
      var roads =  Intersections.findOne({_id: Meteor.user().intersectionId}).roads;
      console.log("roads: ", roads);
      var nwMerger = null;
      if (!!roads.se.connectionId) {
        nwMerger = Intersections.findOne({_id: roads.se.connectionId})
        console.log("se connection found")
      }
      console.log("merger: ", nwMerger);
      return nwMerger;
    }  
  };
  Template.map.intersection = function () {
    if (!!Meteor.user()) {
      return Intersections.findOne({_id: Meteor.user().intersectionId})
    }
  };

  // Template.carS.rendered = function() {
  //   //console.log(this.data);
  //   var car = Cars.findOne(this.data);
  //   //console.log(car)
  //   $('#'+this.data).html(JSON.stringify(car))
  //   //Case: use jquery shit here to insert whatever you want for each car. 
  // }

  Handlebars.registerHelper('arrayify',function(obj){
      result = [];
      for (var key in obj) result.push({name:key,value:obj[key]});
      return result;
  });
}

if (Meteor.isServer) {
  Accounts.onCreateUser(function(options, user) {
    console.log("FB ACCOUNT CUSTOM");
    user.score = 0;
    user.avatar = {"href":"_temp"};
    user.name = user.services.facebook.name;
    user.intersectionId = "none";//= Meteor.call('assignOrAddIntersection', user._id); //give them an intersectioon 
    return user;
    
  });
  
  Accounts.onLogin(function(user) {
    userId = user.user._id;
    if(user.user.intersectionId === "none") {
      Meteor.call('assignOrAddIntersection', userId);
    }
  });
  /* 
  //not working for demo
  Accounts.onLogin(function(user){
    Meteor.call('findOrAddIntersection', function(err, id){ //give them an intersectioon 
      console.log("giving user " + id);
      console.log("user " + user.user._id);
      userId = user.user._id
      Meteor.users.update({_id: userId}, {$set: {intersectionId: id}});
      Intersections.update({_id: id}, {$set: {userId: userId}});
      Meteor.setTimeout(function(){Meteor.call('spawnCars', util.carsPerUser*Meteor.users.find({intersectionId:{$ne: "none"}}).count(), ["edge"])}, 200);
    });
  });
  */

  Meteor.publish(null, function () {
    return Meteor.users.find({_id: this.userId}, {fields: {avatar: 1, intersectionId: 1, score: 1, name: 1}});
  });

  

  Meteor.startup(function () {
    // code to run on server at startup
    console.log("server started!");
    

    //instantiate intersection matrix and load database into matrix
    util.masterMatrix = [[]];
    var topLeftSection = Intersections.findOne({$and: [{"roads.nw.type": "edge"}, {"roads.ne.type": "edge"}]});
    console.log(topLeftSection);
    //fill out row
    //create next row
    //repeat
    var populateMatrix = function (matrix, i) {
      var nextId = null;
      if(!!matrix[i][0]) {
        nextId = _.last(matrix[i]).roads.se.connectionId;
      } 
      if(!!nextId) {
        var nextIntersection = Intersections.findOne({_id: nextId});
        matrix[i].push(nextIntersection);
        populateMatrix(matrix, i);
      }
      else {
        nextId = _.first(matrix[i]).roads.sw.connectionId;
        if(!!nextId) {
          var nextIntersection = Intersections.findOne({_id: nextId});
          matrix.push([nextIntersection]);
          populateMatrix(matrix, i+1);
        }
        else {
          return
        };
      };
    };
    if(!!topLeftSection) {
      util.masterMatrix[0].push(topLeftSection);
      populateMatrix(util.masterMatrix, 0);
      console.log(util.masterMatrix);
    }; 
  });
}
