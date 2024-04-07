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
        this.lX = 0;
        this.bY = 0;
        this.xVelocity = randomFloatBetween(0, PROGRAM_DATA["settings"]["max_cloud_animation_speed_x"]);
        this.xVelocity *= (randomFloatBetween(0,1)==0) ? -1 : 1;
        this.yVelocity = randomFloatBetween(0, PROGRAM_DATA["settings"]["max_cloud_animation_speed_y"]);
        this.scene = new PlaneGameScene();
    }

    /*
        Method Name: getWidth
        Method Parameters: None
        Method Description: Getter
        Method Return: int
    */
    getWidth(){
        return getScreenWidth();
    }

    /*
        Method Name: getHeight
        Method Parameters: None
        Method Description: Getter
        Method Return: int
    */
    getHeight(){
        return getScreenHeight();
    }

    /*
        Method Name: display
        Method Parameters: None
        Method Description: Display the background clouds on the screen
        Method Return: void
    */
    display(){
        if (!this.enabled){ return; }
        this.scene.getCloudManager().display(this.lX, this.bY);
        this.lX += this.xVelocity;
        this.bY += this.yVelocity;
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