class Entity{
    constructor(scene){
        this.id = null;
        this.x = null;
        this.y = null;
        this.scene = scene;
        this.dead = false;
    }

    isDead(){
        return this.dead;
    }

    setDead(dead){
        this.dead = dead;
    }

    die(){
        this.setDead(true);
    }

    getScene(){
        return this.scene;
    }

    distance(entity){
        return Math.sqrt(Math.pow(entity.getX() - this.x, 2) + Math.pow(entity.getY() - this.y, 2));
    }

    setX(x){
        this.setCenterX(x);
    }

    setY(y){
        this.setCenterY(y);
    }

    setCenterX(x){
        this.x = x;
    }

    setCenterY(y){
        this.y = y;
    }

    setID(id){
        this.id = id;
    }

    getID(){
        return this.id;
    }

    getX(){
        return this.getCenterX();
    }

    getCenterX(){
        return this.x;
    }

    getY(){
        return this.y;
    }

    getCenterY(){
        return this.y;
    }

    touchesRegion(lX, rX, bY, tY){
        let x = this.getX();
        let width = this.getWidth();
        let lowerX = x - width / 2;
        let higherX = x + width / 2;
        let withinX = (lowerX >= lX && lowerX <= rX) || (higherX >= lX && higherX <= rX);
        
        let y = this.getY();
        let height = this.getHeight();
        let lowerY = y - height / 2;
        let higherY = y + height / 2;
        let withinY = (lowerY >= bY && lowerY <= tY) || (higherY >= bY && higherY <= tY);
        return withinX && withinY;
    }

    delete(){
        this.scene.delete(this.id);
    }

    // May be overridden
    goodToFollow(){ return false; }
    getDisplayID(){ return this.getID(); }
    hasRadar(){ return false; }

    // Abstract Methods
    getWidth(){}
    getHeight(){}
    getImage(){}
    tick(){}
}
if (typeof window === "undefined"){
    module.exports = Entity;
}