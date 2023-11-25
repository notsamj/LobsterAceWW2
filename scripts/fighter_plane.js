class FighterPlane{
    constructor(planeClass, screenWidth, screenHeight, angle=0, facingRight=true){
        this.planeClass = planeClass;
        this.facingRight = facingRight;
        this.angle = angle;

        // Calculate screen placement x and y
        let currentImage = this.getCurrentImage();
        let width = currentImage.width;
        let height = currentImage.height; 
        this.sPX = Math.floor(screenWidth / 2 - width / 2);
        this.sPY = Math.floor(screenHeight / 2 - height / 2);
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
        if (facingRight != this.facingRight){
            this.angle = 360 - this.angle;
        }
        this.facingRight = facingRight;
    }

    getCurrentImage(){
        return images[this.getImageIdentifier()];
    }

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
}