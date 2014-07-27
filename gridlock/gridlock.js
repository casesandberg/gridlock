if (Meteor.isClient) {
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
  Intersections.find({}).observeChanges({
    changed: function(id, fields) {
      console.log("id: ", id, "fields: ", fields);
      if (!!fields.roads) {
        var roads  = fields.roads;
        if (roads.nw.queue.length === 6) {
          Meteor.call('gridlocked', id);
        } else if (roads.ne.queue.length === 6) {
          Meteor.call('gridlocked', id);
        } else if (roads.sw.queue.length === 6) {
          Meteor.call('gridlocked', id);
        } else if (roads.se.queue.length === 6) {
          Meteor.call('gridlocked', id);
        }
      };
    }
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
