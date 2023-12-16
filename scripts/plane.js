if (typeof window === "undefined"){
    Entity = require("../scripts/entity.js");
}
class Plane extends Entity {
    constructor(planeClass, scene){
        super(scene);
        this.planeClass = planeClass;
    }

    getPlaneClass(){
        return this.planeClass;
    }

    goodToFollow(){ return true; }
}
if (typeof window === "undefined"){
    module.exports = Plane;
}