// When this is opened in NodeJS, import the required files
if (typeof window === "undefined"){
    Entity = require("../scripts/entity.js");
}
/*
    Class Name: Plane
    Description: A subclass of the Entity that represents a general plane
*/
class Plane extends Entity {
    /*
        Method Name: constructor
        Method Parameters:
            planeClass:
                A string representing the type of plane
            scene:
                A Scene object related to the plane
        Method Description: Constructor
        Method Return: Constructor
    */
    constructor(planeClass, scene){
        super(scene);
        this.planeClass = planeClass;
    }

    /*
        Method Name: getPlaneClass
        Method Parameters: None
        Method Description: Getter
        Method Return: String
    */
    getPlaneClass(){
        return this.planeClass;
    }

    /*
        Method Name: goodToFollow
        Method Parameters: None
        Method Description: Provides the information that this object is "good to follow"
        Method Return: boolean, true -> good to follow, false -> not good to follow
    */
    goodToFollow(){ return true; }
}
// When this is opened in NodeJS, export the class
if (typeof window === "undefined"){
    module.exports = Plane;
}