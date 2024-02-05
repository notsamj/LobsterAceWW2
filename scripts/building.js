// TODO: This class needs comments
class Building extends Entity {
    constructor(x, width, height, health){
        super(scene);
        this.x = x;
        this.width = width;
        this.height = height;
        this.hitBox = new RectangleHitbox(width, height, x + width/2, height/2);
        this.health = health;
    }

    getCenterX(){
        return this.x + this.width / 2;
    }

    getCenterY(){
        return this.height / 2;
    }

    getWidth(){
        return this.width;
    }

    getHeight(){
        return this.height;
    }

    display(lX, bY){
        let rX = lX + getScreenWidth() - 1;
        let tY = bY + getScreenHeight() - 1;

        // If not on screen then return
        if (!this.touchesRegion(lX, rX, bY, tY)){ return; }

        // Determine the location it will be displayed at
        let displayX = this.scene.getDisplayX(this.x, 0, lX);
        let displayY = this.scene.getDisplayY(this.height, 0, bY);
        fill("#c2c2c4");
        rect(displayX, displayY, this.width, this.height);
    }
}