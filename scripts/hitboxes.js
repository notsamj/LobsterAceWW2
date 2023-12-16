class CircleHitbox{
    constructor(radius){
        this.x = -1;
        this.y = -1;
        this.radius = radius;
    }

    update(x, y){
        this.x = x;
        this.y = y;
    }

    collidesWith(otherHitbox){
        if (otherHitbox instanceof RectangleHitbox){
            return circleWithRectangle(this, otherHitbox);
        }else{
            return circleWithCircle(this, otherHitbox);
        }
    }

    getX(){
        return this.x;
    }

    getY(){
        return this.y;
    }

    getRadius(){
        return this.radius;
    }

    getRadiusEquivalentX(){
        return this.getRadius();
    }

    getRadiusEquivalentY(){
        return this.getRadius();
    }


}

class RectangleHitbox{
    constructor(width, height){
        this.x1 = -1;
        this.x2 = -1;
        this.y1 = -1;
        this.y2 = -1;
        this.width = width;
        this.height = height;
    }

    update(x, y){
        this.x1 = x - this.width / 2;
        this.x2 = x + this.width / 2;
        this.y1 = y + this.height / 2;
        this.y2 = y - this.height / 2;
    }

    collidesWith(otherHitbox){
        if (otherHitbox instanceof RectangleHitbox){
            return rectangleWithRectangle(this, otherHitbox);
        }else{
            return circleWithRectangle(otherHitbox, this);
        }
    }

    getX1(){
        return this.x1;
    }

    getX2(){
        return this.x2;
    }

    getY1(){
        return this.y1;
    }

    getY2(){
        return this.y2;
    }

    getRadiusEquivalentX(){
        return this.width / 2;
    }

    getRadiusEquivalentY(){
        return this.height / 2;
    }
}

function circleWithRectangle(circleHitbox, rectangleHitbox){
    let circleCenterX = circleHitbox.getX();
    let circleCenterY = circleHitbox.getY();
    let circleRadius = circleHitbox.getRadius();

    let withinX = circleCenterX >= rectangleHitbox.getX1() && circleCenterX <= rectangleHitbox.getX2();
    let withinY = circleCenterY >= rectangleHitbox.getY1() && circleCenterY <= rectangleHitbox.getY2();
    if (withinX && withinY){ return true; }
    // Subtract circle middle from rectangle verticies to calculate around the origin
    let x1 = rectangleHitbox.getX1() - circleCenterY;
    let x2 = rectangleHitbox.getX2() - circleCenterY;
    let y1 = rectangleHitbox.getY1() - circleCenterY;
    let y2 = rectangleHitbox.getY2() - circleCenterY;

    // Check all corners, if any within radius then the rectangle is within touching the circle
    if (Math.pow(x1, 2) + Math.pow(y1, 2) < Math.pow(circleRadius, 2)){ return true; }
    if (Math.pow(x1, 2) + Math.pow(y2, 2) < Math.pow(circleRadius, 2)){ return true; }
    if (Math.pow(x2, 2) + Math.pow(y1, 2) < Math.pow(circleRadius, 2)){ return true; }
    if (Math.pow(x2, 2) + Math.pow(y2, 2) < Math.pow(circleRadius, 2)){ return true; }
    return false;
}

function circleWithCircle(circleHitbox1, circleHitbox2){
    let c1X = circleHitbox1.getX();
    let c2X = circleHitbox2.getX();
    let c1Y = circleHitbox1.getY();
    let c2Y = circleHitbox2.getY();
    let c1R = circleHitbox1.getRadius();
    let c2R = circleHitbox2.getRadius();
    let distance = Math.sqrt(Math.pow(c2X-c1X, 2) + Math.pow(c2Y-c1Y, 2));
    let collide = distance < c1R + c2R;
    return collide;
}

function rectangleWithRectangle(rectangleHitbox1, rectangleHitbox2){
    let s1x1 = rectangleHitbox1.getX1();
    let s1x2 = rectangleHitbox1.getX2();
    let s1y1 = rectangleHitbox1.getY1();
    let s1y2 = rectangleHitbox1.getY2();

    let s2x1 = rectangleHitbox2.getX1();
    let s2x2 = rectangleHitbox2.getX2();
    let s2y1 = rectangleHitbox2.getY1();
    let s2y2 = rectangleHitbox2.getY2();

    // If rectangle1's top left corner is within rectangle2
    if (s1x1 >= s2x1 && s1x1 <= s2x2 && s1y1 >= s2y1 && s1y1 <= s2y2){
        return true;
    }

    // If rectangle1's bottom left corner is within rectangle2
    if (s1x1 >= s2x1 && s1x1 <= s2x2 && s1y2 >= s2y1 && s1y2 <= s2y2){
        return true;
    }

    // If rectangle1's top right corner is within rectangle2
    if (s1x2 >= s2x1 && s1x2 <= s2x2 && s1y1 >= s2y1 && s1y1 <= s2y2){
        return true;
    }

    // If rectangle1's bottom right corner is within rectangle2
    if (s1x2 >= s2x1 && s1x2 <= s2x2 && s1y2 >= s2y1 && s1y2 <= s2y2){
        return true;
    }

    // If rectangle2's top left corner is within rectangle1
    if (s2x1 >= s1x1 && s2x1 <= s1x2 && s2y1 >= s1y1 && s2y1 <= s1y2){
        return true;
    }

    // If rectangle2's bottom left corner is within rectangle1
    if (s2x1 >= s1x1 && s2x1 <= s1x2 && s2y2 >= s1y1 && s2y2 <= s1y2){
        return true;
    }

    // If rectangle2's top right corner is within rectangle1
    if (s2x2 >= s1x1 && s2x2 <= s1x2 && s2y1 >= s1y1 && s2y1 <= s1y2){
        return true;
    }

    // If rectangle2's bottom right corner is within rectangle1
    if (s2x2 >= s1x1 && s2x2 <= s1x2 && s2y2 >= s1y1 && s2y2 <= s1y2){
        return true;
    }

    return false;
}
if (typeof window === "undefined"){
    module.exports = { CircleHitbox, RectangleHitbox };
}