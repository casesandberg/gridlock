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
}

if (Meteor.isServer) {
  Accounts.onCreateUser(function(options, user) {
    console.log("FB ACCOUNT CUSTOM");
    user.score = 0;
    user.interId = "_temp";
    user.avatar = {"href":"_temp"};
    return user;
  });

  Meteor.publish(null, function () {
    return Meteor.users.find({_id: this.userId}, {fields: {avatar: 1, interId: 1, score: 1}});
  });
/*
  styleCount = 5;
  insertCar = function (intersectionId, quadrant, style) {
    chooseSkin = function () { 
      return Math.floor(Math.random()*styleCount);
    };
    car = {
      history: [intersectionId],
      skin: 
    };
    Cars.insert({

    });
  };
  spawnCars = function (maxCars) {
    // see how many cars are in the system
    // add cars until the number reaces maxCars
  };
*/
  Meteor.startup(function () {
    // code to run on server at startup


  });
}
