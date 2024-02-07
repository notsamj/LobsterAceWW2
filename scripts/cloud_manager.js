// TODO: This class needs comments
class CloudManager {
    constructor(){
        this.cloudClusters = new NotSamLinkedList();
    }

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

class CloudCluster {
    constructor(quadrantX, quadrantY){
        this.quadrantX = quadrantX;
        this.quadrantY = quadrantY;
        this.clouds = [];
        this.createClouds();
    }

    getQuadrantX(){
        return this.quadrantX;
    }

    getQuadrantY(){
        return this.quadrantY;
    }

    createClouds(){
        let leftX = this.quadrantX * FILE_DATA["cloud_generation"]["CLOUD_CLUSTER_WIDTH"];
        let bottomY = this.quadrantY * FILE_DATA["cloud_generation"]["CLOUD_CLUSTER_HEIGHT"];
        let seed = this.quadrantX + 2 * this.quadrantY; // TODO: Come up with something better?
        let random = new SeededRandomizer(seed);
        let numClouds = random.getIntInRangeInclusive(FILE_DATA["cloud_generation"]["MIN_CLOUDS_PER_CLUSTER"], FILE_DATA["cloud_generation"]["MAX_CLOUDS_PER_CLUSTER"]);
        for (let i = 0; i < numClouds; i++){
            let newCloudX = random.getIntInRangeExclusive(leftX + FILE_DATA["cloud_generation"]["MAX_RADIUS"], leftX + FILE_DATA["cloud_generation"]["CLOUD_CLUSTER_WIDTH"] - FILE_DATA["cloud_generation"]["MAX_RADIUS"]);
            let newCloudY = random.getIntInRangeExclusive(bottomY + FILE_DATA["cloud_generation"]["MAX_RADIUS"], bottomY + FILE_DATA["cloud_generation"]["CLOUD_CLUSTER_HEIGHT"] - FILE_DATA["cloud_generation"]["MAX_RADIUS"]);
            this.clouds.push(Cloud.create(newCloudX, newCloudY, random))
        }
    }

    display(lX, bY){
        for (let cloud of this.clouds){
            cloud.display(lX, bY);
        }
    }
}

class Cloud {
    constructor(circles){
        this.circles = circles;
    }

    display(lX, bY){
        for (let circleObject of this.circles){
            let screenX = scene.getDisplayX(circleObject["x"], 0, lX);
            let screenY = scene.getDisplayY(circleObject["y"], 0, bY);
            fill(FILE_DATA["cloud_generation"]["CLOUD_COLOUR"]);
            circle(screenX, screenY, circleObject["radius"]*2);
        }
    }
    static create(x, y, random){
        let circles = [];
        let numCircles = random.getIntInRangeInclusive(FILE_DATA["cloud_generation"]["MIN_CIRCLES_PER_CLOUD"], FILE_DATA["cloud_generation"]["MAX_CIRCLES_PER_CLOUD"]);
        for (let i = 0; i < numCircles; i++){
            let circleX = x + random.getIntInRangeInclusive(-1 * FILE_DATA["cloud_generation"]["MAX_RADIUS"], FILE_DATA["cloud_generation"]["MAX_RADIUS"]);
            let circleY = y + random.getIntInRangeInclusive(-1 * FILE_DATA["cloud_generation"]["MAX_RADIUS"], FILE_DATA["cloud_generation"]["MAX_RADIUS"]);
            let circleRadius = random.getIntInRangeInclusive(FILE_DATA["cloud_generation"]["MIN_RADIUS"], FILE_DATA["cloud_generation"]["MAX_RADIUS"]);
            circles.push({"x": circleX, "y": circleY, "radius": circleRadius});
        }
        return new Cloud(circles);
    }
}