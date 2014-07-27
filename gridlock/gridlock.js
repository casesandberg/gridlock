if (Meteor.isClient) {
  Template.hello.greeting = function () {
    return "Welcome to gridlock.";
  };

  Template.hello.events({
    'click input': function () {
      // template data, if any, is available in 'this'
      if (typeof console !== 'undefined') {
        
      }
    }
  });

  Template.car.events({
    'click input.pull': function () {
      
    }
  })
}

if (Meteor.isServer) {
  Accounts.onCreateUser(function(options, user) {
    console.log("FB ACCOUNT CUSTOM");
    user.score = 0;
    user.intersectionId = "_temp";
    user.avatar = {"href":"_temp"};
    //give them an intersectioon
    
    return user;
  });

  Meteor.publish(null, function () {
    return Meteor.users.find({_id: this.userId}, {fields: {avatar: 1, intersectionId: 1, score: 1}});
  });

  

  Meteor.startup(function () {
    // code to run on server at startup
    console.log("server started!");
    

    //instantiate intersection matrix and load database into matrix
    util.masterMatrix = [];
    var topLeftSection = Intersections.findOne({$and: [{"roads.nw.type": "edge"}, {"roads.ne.type": "edge"}]});
    util.masterMatrix.push([topLeftSection]);
    console.log(util.masterMatrix);
    //fill out row
    //create next row
    //repeat
    var populateMatrix = function (matrix, i) {
      var nextId = _.last(matrix[i]).roads.se.connectionId;
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
    populateMatrix(util.masterMatrix, 0);
    console.log(util.masterMatrix);
  });
}
