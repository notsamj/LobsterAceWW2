// When this is opened in NodeJS, import the required files
if (typeof window === "undefined"){
    FighterPlane = require("../scripts/fighter_plane.js");
    onSameTeam = require("../scripts/helper_functions.js").onSameTeam;
    Bullet = require("../scripts/bullet.js");
    var helperFuncs = require("../scripts/helper_functions.js");
    angleBetweenCCWDEG = helperFuncs.angleBetweenCCWDEG;
    fixDegrees = helperFuncs.fixDegrees;
    calculateAngleDiffDEGCW = helperFuncs.calculateAngleDiffDEGCW;
    calculateAngleDiffDEGCCW = helperFuncs.calculateAngleDiffDEGCCW;
    calculateAngleDiffDEG = helperFuncs.calculateAngleDiffDEG;
    toDegrees = helperFuncs.toDegrees;
    InfiniteLoopFinder = require("../scripts/infinite_loop_finder.js");
}
/*
    Class Name: BotFighterPlane
    Description: An abstract subclass of the FighterPlane that determines actions without human input
*/
class BotFighterPlane extends FighterPlane {
    // TODO: Remove class?
}

// If using Node JS Export the class
if (typeof window === "undefined"){
    module.exports = BotFighterPlane;
}