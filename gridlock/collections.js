//Data Definitions
/*
Intersection: document             intersection in the grid
  roads: object                   object of the roads eminating from this intersection
    ne: object                    road direction
      queue: [carId]              ordered list of cars
      connectionId: UUID               intersection this road connects to
      type: string                human/empty/computer
    nw...
    se...
    sw...

Car: document
  destination: string             ne/nw/se/sw
  history: [UUID]                 intersections car has passed
  skin: int                       look of car

User: document
  score: int                      number of cars passed
  interId: UUID                   assigned intersection
  name: string                    name
  avatar: string                  href to photo from FB
*/
//User collection created by accounts package

Intersections = new Meteor.Collection("intersections");
Cars = new Meteor.Collection("cars");