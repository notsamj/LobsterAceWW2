/*
    Class Name: CloudManager
    Description: Creates procedurally generated clouds
*/
class CloudManager {
    /*
        Method Name: constructor
        Method Parameters: None
        Method Description: Constructor
        Method Return: Constructor
    */
    constructor(){
        this.cloudClusters = new NotSamLinkedList();
    }

    /*
        Method Name: display
        Method Parameters:
            lX:
                The bottom left x displayed on the canvas relative to the focused entity
            bY:
                The bottom left y displayed on the canvas relative to the focused entity
        Method Description: Displays clouds in the 1-4 quadrants shown on screen.
        Method Return: void
    */
    display(lX, bY){
        // Fill the entire screen with the sky background
        fill(FILE_DATA["cloud_generation"]["SKY_COLOUR"]);
        rect(0, 0, getScreenWidth(), getScreenHeight());

        let rX = lX + getScreenWidth() - 1;
        let tY = bY + getScreenHeight() - 1;
        let leftQuadrantX = Math.floor(lX / FILE_DATA["cloud_generation"]["CLOUD_CLUSTER_WIDTH"]);
        let rightQuadrantX = Math.floor(rX / FILE_DATA["cloud_generation"]["CLOUD_CLUSTER_WIDTH"]);
        let bottomQuadrantY = Math.floor(bY / FILE_DATA["cloud_generation"]["CLOUD_CLUSTER_HEIGHT"]);
        let topQuadrantY = Math.floor(tY / FILE_DATA["cloud_generation"]["CLOUD_CLUSTER_HEIGHT"]);

        // Display bottom left quadrant
        this.getCloudCluster(leftQuadrantX, bottomQuadrantY).display(lX, bY);
        // If both the left and right quadrant are visible
        if (leftQuadrantX != rightQuadrantX){
            // Display bottom right quadrant
            this.getCloudCluster(rightQuadrantX, bottomQuadrantY).display(lX, bY);
        }

        // If both the top and bottom quadrant are visible
        if (bottomQuadrantY != topQuadrantY){
            this.getCloudCluster(leftQuadrantX, topQuadrantY).display(lX, bY);
             // If both the left and right quadrant are visible
            if (leftQuadrantX != rightQuadrantX){
                // Display bottom right quadrant
                this.getCloudCluster(rightQuadrantX, topQuadrantY).display(lX, bY);
            }
        }
        // Save space by deleting far away cloud clusters
        this.deleteFarClusters(lX, bY);
    }

    /*
        Method Name: getCloudCluster
        Method Parameters: 
            quadrantX:
                The quadrant identifier with respect to the x axis
            quadrantY:
                The quadrant identifier with respect to the y axis
        Method Description: Finds a cloud cluster with the given identifiers and return it
        Method Return: CloudCluster
    */
    getCloudCluster(quadrantX, quadrantY){
        let cC = null;
        // Find the Cloud Cluster if it exists
        for (let [cluster, clusterIndex] of this.cloudClusters){
            if (cluster.getQuadrantX() == quadrantX && cluster.getQuadrantY() == quadrantY){
                cC = cluster;
                break;
            }
        }
        // If Cloud Cluster do not exist, create it
        if (cC == null){
            cC = new CloudCluster(quadrantX, quadrantY);
            this.cloudClusters.append(cC);
        }
        return cC;
    }

    /*
        Method Name: deleteFarClusters
        Method Parameters:
            lX:
                The bottom left x displayed on the canvas relative to the focused entity
            bY:
                The bottom left y displayed on the canvas relative to the focused entity
        Method Description: Deletes all clusters that are a sufficient distance from the area currently being shown on screen
        Method Return: void
    */
    deleteFarClusters(lX, bY){
        let cX = lX + 0.5 * getScreenWidth();
        let cY = bY + 0.5 * getScreenHeight();
        for (let i = this.cloudClusters.getLength() - 1; i >= 0; i--){
            let cluster = this.cloudClusters.get(i);
            let distance = Math.sqrt(Math.pow(cluster.getQuadrantX() * FILE_DATA["cloud_generation"]["CLOUD_CLUSTER_WIDTH"] - cX, 2) + Math.pow(cluster.getQuadrantY() * FILE_DATA["cloud_generation"]["CLOUD_CLUSTER_HEIGHT"] - cY, 2));
            // Delete clusters more than 2 times max(width, height) away from the center of the screen
            if (distance > 2 * Math.max(FILE_DATA["cloud_generation"]["CLOUD_CLUSTER_WIDTH"], FILE_DATA["cloud_generation"]["CLOUD_CLUSTER_HEIGHT"])){
                this.cloudClusters.remove(i);
            }
        }
    }


}

/*
    Class Name: CloudCluster
    Description: A collection of cloud objects in a x, y region
*/
class CloudCluster {
    /*
        Method Name: constructor
        Method Parameters: 
            quadrantX:
                The quadrant identifier with respect to the x axis
            quadrantY:
                The quadrant identifier with respect to the y axis
        Method Description: Constructor
        Method Return: Constructor
    */
    constructor(quadrantX, quadrantY){
        this.quadrantX = quadrantX;
        this.quadrantY = quadrantY;
        this.clouds = [];
        this.createClouds();
    }

    /*
        Method Name: getQuadrantX
        Method Parameters: None
        Method Description: Getter
        Method Return: Integer
    */
    getQuadrantX(){
        return this.quadrantX;
    }

    /*
        Method Name: getQuadrantY
        Method Parameters: None
        Method Description: Getter
        Method Return: Integer
    */
    getQuadrantY(){
        return this.quadrantY;
    }

    /*
        Method Name: createClouds
        Method Parameters: None
        Method Description: Creates many cloud objects
        Method Return: void
    */
    createClouds(){
        let leftX = this.quadrantX * FILE_DATA["cloud_generation"]["CLOUD_CLUSTER_WIDTH"];
        let bottomY = this.quadrantY * FILE_DATA["cloud_generation"]["CLOUD_CLUSTER_HEIGHT"];
        let seed = this.quadrantX + 2 * this.quadrantY; // TODO: Come up with something better?
        let random = new SeededRandomizer(seed);
        let numClouds = random.getIntInRangeInclusive(FILE_DATA["cloud_generation"]["MIN_CLOUDS_PER_CLUSTER"], FILE_DATA["cloud_generation"]["MAX_CLOUDS_PER_CLUSTER"]);
        
        // Create as many clouds as chosen
        for (let i = 0; i < numClouds; i++){
            let newCloudX = random.getIntInRangeExclusive(leftX + FILE_DATA["cloud_generation"]["MAX_RADIUS"] * 2, leftX + FILE_DATA["cloud_generation"]["CLOUD_CLUSTER_WIDTH"] - FILE_DATA["cloud_generation"]["MAX_RADIUS"] * 2);
            let newCloudY = random.getIntInRangeExclusive(bottomY + FILE_DATA["cloud_generation"]["MAX_RADIUS"] * 2, bottomY + FILE_DATA["cloud_generation"]["CLOUD_CLUSTER_HEIGHT"] - FILE_DATA["cloud_generation"]["MAX_RADIUS"] * 2);
            this.clouds.push(Cloud.create(newCloudX, newCloudY, random))
        }
    }

    /*
        Method Name: display
        Method Parameters:
            lX:
                The bottom left x displayed on the canvas relative to the focused entity
            bY:
                The bottom left y displayed on the canvas relative to the focused entity
        Method Description: Displays all the clouds in the cluster
        Method Return: void
    */
    display(lX, bY){
        for (let cloud of this.clouds){
            cloud.display(lX, bY);
        }
    }
}

/*
    Class Name: Cloud
    Description: A collection of circles.
*/
class Cloud {
    /*
        Method Name: constructor
        Method Parameters: None
        Method Description: Constructor
        Method Return: Constructor
    */
    constructor(circles){
        this.circles = circles;
    }

    /*
        Method Name: display
        Method Parameters:
            lX:
                The bottom left x displayed on the canvas relative to the focused entity
            bY:
                The bottom left y displayed on the canvas relative to the focused entity
        Method Description: Displays all the circles in the cloud.
        Method Return: void
    */
    display(lX, bY){
        for (let circleObject of this.circles){
            let screenX = scene.getDisplayX(circleObject["x"], 0, lX, false);
            let screenY = scene.getDisplayY(circleObject["y"], 0, bY, false);
            strokeWeight(0);
            fill(FILE_DATA["cloud_generation"]["CLOUD_COLOUR"]);
            circle(screenX, screenY, circleObject["radius"]*2);
            strokeWeight(1);
        }
    }

    /*
        Method Name: create
        Method Parameters:
            x: 
                Center x of the circle
            y:
                Center y of the circle
            random:
                The random number generator instance
        Method Description: Creates a cirlce object given x, y, random number generator
        Method Return: Cloud
    */
    static create(x, y, random){
        let circles = [];
        let numCircles = random.getIntInRangeInclusive(FILE_DATA["cloud_generation"]["MIN_CIRCLES_PER_CLOUD"], FILE_DATA["cloud_generation"]["MAX_CIRCLES_PER_CLOUD"]);
        let mainRadius = random.getIntInRangeInclusive(FILE_DATA["cloud_generation"]["MIN_RADIUS"], FILE_DATA["cloud_generation"]["MAX_RADIUS"]);
        circles.push({"x": x, "y": y, "radius": mainRadius});
        for (let i = 0; i < numCircles - 1; i++){
            let circleX = x + random.getIntInRangeInclusive(-1 * mainRadius, mainRadius);
            let circleY = y + random.getIntInRangeInclusive(-1 * mainRadius, mainRadius);
            let circleRadius = random.getIntInRangeInclusive(FILE_DATA["cloud_generation"]["MIN_RADIUS"], FILE_DATA["cloud_generation"]["MAX_RADIUS"]);
            circles.push({"x": circleX, "y": circleY, "radius": circleRadius});
        }
        return new Cloud(circles);
    }
}