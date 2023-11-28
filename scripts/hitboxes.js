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
        if (otherHitbox instanceof SquareHitbox){
            return circleWithSquare(this, otherHitbox);
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
}

class SquareHitbox{
    constructor(){
        this.x1 = -1;
        this.x2 = -1;
        this.y1 = -1;
        this.y2 = -1;
    }

    update(x1, x2, y1, y2){
        this.x1 = x1;
        this.x2 = x2;
        this.y1 = y1;
        this.y2 = y2;
    }

    collidesWith(otherHitbox){
        if (otherHitbox instanceof SquareHitbox){
            return squareWithSquare(this, otherHitbox);
        }else{
            return circleWithSquare(otherHitbox, this);
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
}

function circleWithSquare(circleHitbox, squareHitbox){
    let circleCenterX = circleHitbox.getX();
    let circleCenterY = circleHitbox.getY();
    let circleRadius = circleHitbox.getRadius();

    let withinX = circleCenterX >= squareHitbox.getX1() && circleCenterX <= squareHitbox.getX2();
    let withinY = circleCenterY >= squareHitbox.getY1() && circleCenterY <= squareHitbox.getY2();
    if (withinX && withinY){ return true; }
    // Subtract circle middle from square verticies to calculate around the origin
    let x1 = squareHitbox.getX1() - circleCenterY;
    let x2 = squareHitbox.getX2() - circleCenterY;
    let y1 = squareHitbox.getY1() - circleCenterY;
    let y2 = squareHitbox.getY2() - circleCenterY;

    // Check all corners, if any within radius then the square is within touching the circle
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
    let collide = c1R - c2R < distance && distance < c1R + c2R;
    return collide;
}

function squareWithSquare(squareHitbox1, squareHitbox2){
    let s1x1 = squareHitbox1.getX1();
    let s1x2 = squareHitbox1.getX2();
    let s1y1 = squareHitbox1.getY1();
    let s1y2 = squareHitbox1.getY2();

    let s2x1 = squareHitbox2.getX1();
    let s2x2 = squareHitbox2.getX2();
    let s2y1 = squareHitbox2.getY1();
    let s2y2 = squareHitbox2.getY2();

    // If square1's top left corner is within square2
    if (s1x1 >= s2x1 && s1x1 <= s2x2 && s1y1 >= s2y1 && s1y1 <= s2y2){
        return true;
    }

    // If square1's bottom left corner is within square2
    if (s1x1 >= s2x1 && s1x1 <= s2x2 && s1y2 >= s2y1 && s1y2 <= s2y2){
        return true;
    }

    // If square1's top right corner is within square2
    if (s1x2 >= s2x1 && s1x2 <= s2x2 && s1y1 >= s2y1 && s1y1 <= s2y2){
        return true;
    }

    // If square1's bottom right corner is within square2
    if (s1x2 >= s2x1 && s1x2 <= s2x2 && s1y2 >= s2y1 && s1y2 <= s2y2){
        return true;
    }

    // If square2's top left corner is within square1
    if (s2x1 >= s1x1 && s2x1 <= s1x2 && s2y1 >= s1y1 && s2y1 <= s1y2){
        return true;
    }

    // If square2's bottom left corner is within square1
    if (s2x1 >= s1x1 && s2x1 <= s1x2 && s2y2 >= s1y1 && s2y2 <= s1y2){
        return true;
    }

    // If square2's top right corner is within square1
    if (s2x2 >= s1x1 && s2x2 <= s1x2 && s2y1 >= s1y1 && s2y1 <= s1y2){
        return true;
    }

    // If square2's bottom right corner is within square1
    if (s2x2 >= s1x1 && s2x2 <= s1x2 && s2y2 >= s1y1 && s2y2 <= s1y2){
        return true;
    }

    return false;
}