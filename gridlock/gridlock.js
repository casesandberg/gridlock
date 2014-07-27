if (Meteor.isClient) {
  Template.hello.greeting = function () {
    return "User:";
  };
  Template.hello.user = function () {
    return Meteor.user();
  }
  Template.neighbors.roads = function () {
    if (!!Meteor.user()) {
      var roads =  Intersections.findOne({_id: Meteor.user().intersectionId}).roads
      console.log(roads);
      if (!!roads.nw.connectionId) {
        var nw = Intersections.findOne({_id: roads.nw.connectionId})
      };
       
    }  
  }
  Template.roads.intersection = function () {
    if (!!Meteor.user()) {
      return Intersections.findOne({_id: Meteor.user().intersectionId})
    }
  };
  Template.map.intersection = function () {
    if (!!Meteor.user()) {
      return Intersections.findOne({_id: Meteor.user().intersectionId})
    }
  };
  Template.intersection.moving = function () {
    if (!!Meteor.user()) {
      var moving = Intersections.findOne({_id: Meteor.user().intersectionId}).moving;
      console.log(moving)
      return moving
    }
  };
  Template.carP.rendered = function() {
    //console.log(this.data);
    var car = Cars.findOne(this.data);
    //console.log(car)
    $('#'+this.data).html(JSON.stringify(car))
    //Case: use jquery shit here to insert whatever you want for each car. 
  }
  Template.carS.rendered = function() {
    //console.log(this.data);
    var car = Cars.findOne(this.data);
    //console.log(car)
    $('#'+this.data).html(JSON.stringify(car))
    //Case: use jquery shit here to insert whatever you want for each car. 
  }

  Handlebars.registerHelper('arrayify',function(obj){
      result = [];
      for (var key in obj) result.push({name:key,value:obj[key]});
      return result;
  });

  Template.hello.events({
    'click input': function () {
      // template data, if any, is available in 'this'
      if (typeof console !== 'undefined') {
        
      }
    }
  });

  Template.carP.events({
    'click input.pull': function (e, t) {
      console.log(t.data);
      Meteor.call('pullCar', t.data)
    }
  });
  Template.carS.events({
    'click input.send': function (e, t) {
      console.log(t);
      Meteor.call('sendCar', t.data);
    }
  })
}

if (Meteor.isServer) {
  Accounts.onCreateUser(function(options, user) {
    console.log("FB ACCOUNT CUSTOM");
    user.score = 0;
    user.avatar = {"href":"_temp"};
    user.name = user.services.facebook.name;
    return user;
  });
  
  Accounts.onLogin(function(user){
    Meteor.call('findOrAddIntersection', function(err, id){ //give them an intersectioon 
      console.log("giving user " + id);
      console.log("user " + user.user._id);
      userId = user.user._id
      Meteor.users.update({_id: userId}, {$set: {intersectionId: id}});
      Intersections.update({_id: id}, {$set: {userId: userId}});
    });
  });

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
