class Plane extends Entity{
    constructor(planeClass){
        super();
        this.planeClass = planeClass;
    }

    getPlaneClass(){
        return this.planeClass;
    }

    goodToFollow(){ return true; }
}