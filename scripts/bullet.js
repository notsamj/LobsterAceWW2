class Bullet extends Entity{
    constructor(x, y, xVelocity, yVelocity, angle, shooterID, shooterClass){
        super();
        this.x = x;
        this.y = y;
        this.image = images["bullet"];
        angle = toRadians(angle);
        this.yVelocity = yVelocity + Math.sin(angle) * fileData["bullet_data"]["speed"];
        this.xVelocity = xVelocity + Math.cos(angle) * fileData["bullet_data"]["speed"];
        this.hitBox = new CircleHitbox(fileData["bullet_data"]["radius"]);
        this.shooterClass = shooterClass;
        this.shooterID = shooterID;
        // TODO: If on screen then
        //document.getElementById("shotSound").play();
    }

    tick(timePassed){
        let timeProportion = timePassed / 1000;
        let yAcceleration = GRAVITY * timeProportion;

        this.yVelocity = this.yVelocity - yAcceleration;
        this.x += this.xVelocity * timeProportion;
        this.y += this.yVelocity * timeProportion;

        // If below ground
        if (this.y < 0){
            this.delete();
        }
    }

    getWidth(){
        return this.image.width;
    }
    getHeight(){
        return this.image.height;
    }
    getImage(){
        return this.image;
    }

    getHitbox(){
        this.hitBox.update(this.x, this.y);
        return this.hitBox;
    }

    getShooterID(){
        return this.shooterID;
    }

    getShooterClass(){
        return this.shooterClass;
    }
}