if (Meteor.isClient) {
  Template.hello.greeting = function () {
    return "Welcome to gridlock.";
  };

  Template.hello.events({
    'click input': function () {
      // template data, if any, is available in 'this'
      if (typeof console !== 'undefined')
        console.log("You pressed the button");
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

  Meteor.startup(function () {
    // code to run on server at startup
  });
}
