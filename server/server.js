const ServerDogfight = require("server_dogfight.js");
console.log(new GameMode())
console.log(new Dogfight())
// What's important so far is we've exablished we can share classes this way without breaking the main game :)
// TODO: Just make server versions of each of these by simply extending them
// TODO: For variables like scene maybe at top of file: if nodeJS then scene = (require SharedVariables.js).getVariable("scene")