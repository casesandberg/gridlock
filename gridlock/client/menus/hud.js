Template.hud.user = function () {
	return Meteor.user();
}

Deps.autorun(function(){
	if (!!Meteor.user()) {
		// $('.foo')
		if(Meteor.user().score === -1) {
			$('.hud-gridlock').show();
		} else {
			$('.hud-gridlock').hide();
		}	
	} else {
		// $('.foo')
	}
});

Meteor.setInterval(function(){
	Meteor.call('spawnCars',5, ["edge"]);
},2000);

Template.hud.events({
	'click .gridlock-cta': function() {
		if (!!Meteor.user()) {
			Meteor.call('postGridlock', Meteor.user()._id);	
		};
		
	}
})
Template.hud.nw = function () {
  if (!!Meteor.user()) {
    var roads =  Intersections.findOne({_id: Meteor.user().intersectionId}).roads;
    // console.log("roads: ", roads);
    var seMerger = null;
    if (!!roads.nw.connectionId) {
      seMerger = Intersections.findOne({_id: roads.nw.connectionId})
      console.log("nw connection found");
    }
    // console.log("merger: ", seMerger);
    return seMerger;
  }  
};
Template.hud.ne = function () {
  if (!!Meteor.user()) {
    var roads =  Intersections.findOne({_id: Meteor.user().intersectionId}).roads;
    // console.log("roads: ", roads);
    var swMerger = null;
    if (!!roads.ne.connectionId) {
      swMerger = Intersections.findOne({_id: roads.ne.connectionId})
      console.log("ne connection found")
    }
    // console.log("merger: ", swMerger);
    return swMerger;
  }  
};
Template.hud.sw = function () {
  if (!!Meteor.user()) {
    var roads =  Intersections.findOne({_id: Meteor.user().intersectionId}).roads;
    // console.log("roads: ", roads);
    var neMerger = null;
    if (!!roads.sw.connectionId) {
      neMerger = Intersections.findOne({_id: roads.sw.connectionId})
      console.log("sw connection found")
    }
    // console.log("merger: ", neMerger);
    return neMerger;
  }  
};
Template.hud.se = function () {
  if (!!Meteor.user()) {
    var roads =  Intersections.findOne({_id: Meteor.user().intersectionId}).roads;
    // console.log("roads: ", roads);
    var nwMerger = null;
    if (!!roads.se.connectionId) {
      nwMerger = Intersections.findOne({_id: roads.se.connectionId})
      console.log("se connection found")
    }
    // console.log("merger: ", nwMerger);
    return nwMerger;
  }  
};