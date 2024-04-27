/*
    Class Name: AnimatedCloudBackground
    Description: A subclass of Component. A moving background of clouds.
*/
class AnimatedCloudBackground extends Component {
    /*
        Method Name: constructor
        Method Parameters: None
        Method Description: Constructor
        Method Return: Constructor
    */
    constructor(){
        super();
        this.centerX = randomFloatBetween(100000,200000);
        this.centerY = randomFloatBetween(100000,200000);
        this.xVelocity = randomFloatBetween(0, PROGRAM_DATA["settings"]["max_cloud_animation_speed_x"]);
        this.xVelocity *= (randomFloatBetween(0,1)==0) ? -1 : 1;
        this.yVelocity = randomFloatBetween(0, PROGRAM_DATA["settings"]["max_cloud_animation_speed_y"]);
        this.scene = new PlaneGameScene(null, true);
    }

    /*
        Method Name: getWidth
        Method Parameters: None
        Method Description: Getter
        Method Return: int
    */
    getWidth(){
        return getZoomedScreenWidth();
    }

    /*
        Method Name: getHeight
        Method Parameters: None
        Method Description: Getter
        Method Return: int
    */
    getHeight(){
        return getZoomedScreenHeight();
    }

    /*
        Method Name: display
        Method Parameters: None
        Method Description: Display the background clouds on the screen
        Method Return: void
    */
    display(){
        if (!this.enabled){ return; }
        let lX = this.centerX - getZoomedScreenWidth() / 2;
        let bY = this.centerY - getZoomedScreenHeight() / 2;
        this.scene.getSkyManager().display(lX, bY);
        this.centerX += this.xVelocity;
        this.centerY += this.yVelocity;
    }

    /*
        Method Name: covers
        Method Parameters:
            x:
                Screen coordinate x
            y:
                Screen coordinate y
        Method Description: Determines whether the background covers a point on the screen
        Method Return: boolean, true -> covers, false -> does not cover
    */
    covers(x, y){
        return true;
    }
}