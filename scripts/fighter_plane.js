const MAX_THROTTLE = 100;
const FALL_SPEED = 200;
const SLOW_DOWN_AMOUNT = 0.01;
// Abstract Class
class FighterPlane extends Entity{
    constructor(planeClass, angle, facingRight){
        super();
        this.planeClass = planeClass;
        this.facingRight = facingRight;
        this.angle = angle;
        this.throttle = MAX_THROTTLE;
        this.maxSpeed = fileData["plane_data"][planeClass]["max_speed"];
        this.speed = this.maxSpeed;
        this.shootLock = new CooldownLock(100);
        this.hitBox = new CircleHitbox(fileData["plane_data"][planeClass]["radius"]);
        this.health = fileData["plane_data"][planeClass]["health"];
        this.throttleConstant = Math.sqrt(this.maxSpeed) / MAX_THROTTLE;
        loadRotatedImages(planeClass);
    }

    damage(amount){
        this.health -= amount;
        if (this.health <= 0){
            // TODO: Explosion
            this.delete();
        }
    }

    shoot(){
        scene.addEntity(new Bullet(this.getX(), this.getY(), this.getXVelocity(), this.getYVelocity(), this.getShootingAngle(), this.getID()));
    }

    adjustAngle(amount){
        let newAngle = this.angle;

        // Determine angle
        if (this.facingRight){
            newAngle += amount;
        }else{
            newAngle -= amount;
        }

        while(newAngle >= 360){
            newAngle -= 360;
        }
        while(newAngle < 0){
            newAngle += 360;
        }
        this.angle = Math.floor(newAngle);
    }

    face(facingRight){
        // If not switching directions nothing to do
        if (facingRight == this.facingRight){
            return;
        }
        let newAngle = 360 - this.angle;
        while (newAngle >= 360){
            newAngle -= 360;
        }
        while (newAngle < 0){
            newAngle += 360;
        }
        this.angle = newAngle;
        this.facingRight = facingRight;
        this.speed *= (1 - SLOW_DOWN_AMOUNT);
    }

    getCurrentImage(){
        return images[this.getImageIdentifier()];
    }

    getImage(){ return this.getCurrentImage(); }

    getImageIdentifier(){
        let rightLeftStr = "_right_";
        if (!this.facingRight){
            rightLeftStr = "_left_";
        }
        return this.planeClass + rightLeftStr + this.angle.toString();
    }

    display(){
        let image = this.getCurrentImage();
        drawingContext.drawImage(this.getCurrentImage(), this.sPX, this.sPY);
    }

    getWidth(){
        return this.getCurrentImage().width;
    }

    getHeight(){
        return this.getCurrentImage().height;
    }

    tick(timeDiffMS){
        let timeProportion = (timeDiffMS / 1000);

        // Throttle - Drag
        let throttleAcc = this.throttle * this.throttleConstant;
    
        // Drag
        let dragAcc = Math.sqrt(Math.abs(this.speed));

        let acceleration = throttleAcc - dragAcc;

        // Speed
        this.speed += acceleration * timeProportion;

        // Finally the position
        
        // Handle zero throttle
        if (this.throttle > 0){
            this.y += this.getYVelocity() * timeProportion;
        }else{
            this.y -= FALL_SPEED * timeProportion;
        }

        this.x += this.getXVelocity() * timeProportion;
    }

    getXVelocity(){
        let effectiveAngle = this.getEffectiveAngle();
        let cosAngle = Math.cos(toRadians(effectiveAngle));
        return this.speed * cosAngle * (!this.facingRight ? -1 : 1);
    }

    getEffectiveAngle(){
        let effectiveAngle = this.angle;
        if (!this.facingRight){
            effectiveAngle = 360 - effectiveAngle;
        }
        return effectiveAngle;
    }

    getShootingAngle(){
        return this.angle + (this.facingRight ? 0 : 180);

    }

    getYVelocity(){
        let effectiveAngle = this.getEffectiveAngle();
        let sinAngle = Math.sin(toRadians(effectiveAngle))
        return this.speed * sinAngle;
    }

    getSpeed(){
        return this.speed;
    }

    getThrottle(){
        return this.throttle;
    }

    adjustThrottle(amt){
        this.throttle = Math.min(Math.max(0, this.throttle + amt), MAX_THROTTLE);
    }

    collidesWith(otherHitbox){
        this.hitBox.update(this.x, this.y);
        return this.hitBox.collidesWith(otherHitbox);
    }
}