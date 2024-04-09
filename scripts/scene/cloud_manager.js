/*
    Class Name: CloudManager
    Description: Creates procedurally generated clouds
*/
class CloudManager {
    /*
        Method Name: constructor
        Method Parameters:
            scene:
                A scene to manage the clouds for
        Method Description: Constructor
        Method Return: Constructor
    */
    constructor(scene){
        this.cloudClusters = new NotSamLinkedList();
        this.scene = scene;
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
        fill(PROGRAM_DATA["cloud_generation"]["sky_colour"]);
        rect(0, 0, getScreenWidth(), getScreenHeight());

        let rX = lX + getScreenWidth() - 1;
        let tY = bY + getScreenHeight() - 1;
        let leftQuadrantX = Math.floor(lX / PROGRAM_DATA["cloud_generation"]["cloud_cluster_width"]);
        let rightQuadrantX = Math.floor(rX / PROGRAM_DATA["cloud_generation"]["cloud_cluster_width"]);
        let bottomQuadrantY = Math.floor(bY / PROGRAM_DATA["cloud_generation"]["cloud_cluster_height"]);
        let topQuadrantY = Math.floor(tY / PROGRAM_DATA["cloud_generation"]["cloud_cluster_height"]);

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
            cC = new CloudCluster(quadrantX, quadrantY, this.scene);
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
            let distance = Math.sqrt(Math.pow(cluster.getQuadrantX() * PROGRAM_DATA["cloud_generation"]["cloud_cluster_width"] - cX, 2) + Math.pow(cluster.getQuadrantY() * PROGRAM_DATA["cloud_generation"]["cloud_cluster_height"] - cY, 2));
            // Delete clusters more than 2 times max(width, height) away from the center of the screen
            if (distance > 2 * Math.max(PROGRAM_DATA["cloud_generation"]["cloud_cluster_width"], PROGRAM_DATA["cloud_generation"]["cloud_cluster_height"])){
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
            scene:
                A scene object for the clouds
        Method Description: Constructor
        Method Return: Constructor
    */
    constructor(quadrantX, quadrantY, scene){
        this.quadrantX = quadrantX;
        this.quadrantY = quadrantY;
        this.clouds = [];
        this.createClouds(scene);
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
        Method Parameters:
            scene:
                A scene to put the cloud sin
        Method Description: Creates many cloud objects
        Method Return: void
    */
    createClouds(scene){
        let leftX = this.quadrantX * PROGRAM_DATA["cloud_generation"]["cloud_cluster_width"];
        let bottomY = this.quadrantY * PROGRAM_DATA["cloud_generation"]["cloud_cluster_height"];
        let seed = this.quadrantX + 2 * this.quadrantY; // TODO: Come up with something better?
        let random = new SeededRandomizer(seed);
        let numClouds = random.getIntInRangeInclusive(PROGRAM_DATA["cloud_generation"]["min_clouds_per_cluster"], PROGRAM_DATA["cloud_generation"]["max_clouds_per_cluster"]);
        
        // Create as many clouds as chosen
        for (let i = 0; i < numClouds; i++){
            let newCloudX = random.getIntInRangeExclusive(leftX + PROGRAM_DATA["cloud_generation"]["max_radius"] * 2, leftX + PROGRAM_DATA["cloud_generation"]["cloud_cluster_width"] - PROGRAM_DATA["cloud_generation"]["max_radius"] * 2);
            let newCloudY = random.getIntInRangeExclusive(bottomY + PROGRAM_DATA["cloud_generation"]["max_radius"] * 2, bottomY + PROGRAM_DATA["cloud_generation"]["cloud_cluster_height"] - PROGRAM_DATA["cloud_generation"]["max_radius"] * 2);
            this.clouds.push(Cloud.create(newCloudX, newCloudY, random, scene))
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
        Method Parameters:
            circles:
                A list of JSON object representing circles
            scene:
                A scene object for the clouds
        Method Description: Constructor
        Method Return: Constructor
    */
    constructor(circles, scene){
        this.circles = circles;
        this.scene = scene;
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
            let screenX = this.scene.getDisplayX(circleObject["x"], 0, lX, false);
            let screenY = this.scene.getDisplayY(circleObject["y"], 0, bY, false);
            strokeWeight(0);
            fill(PROGRAM_DATA["cloud_generation"]["cloud_colour"]);
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
            scene:
                The scene that the clouds are apart of
        Method Description: Creates a cirlce object given x, y, random number generator
        Method Return: Cloud
    */
    static create(x, y, random, scene){
        let circles = [];
        let numCircles = random.getIntInRangeInclusive(PROGRAM_DATA["cloud_generation"]["min_circles_per_cloud"], PROGRAM_DATA["cloud_generation"]["max_circles_per_cloud"]);
        let mainRadius = random.getIntInRangeInclusive(PROGRAM_DATA["cloud_generation"]["min_radius"], PROGRAM_DATA["cloud_generation"]["max_radius"]);
        circles.push({"x": x, "y": y, "radius": mainRadius});
        for (let i = 0; i < numCircles - 1; i++){
            let circleX = x + random.getIntInRangeInclusive(-1 * mainRadius, mainRadius);
            let circleY = y + random.getIntInRangeInclusive(-1 * mainRadius, mainRadius);
            let circleRadius = random.getIntInRangeInclusive(PROGRAM_DATA["cloud_generation"]["min_radius"], PROGRAM_DATA["cloud_generation"]["max_radius"]);
            circles.push({"x": circleX, "y": circleY, "radius": circleRadius});
        }
        return new Cloud(circles, scene);
    }
}