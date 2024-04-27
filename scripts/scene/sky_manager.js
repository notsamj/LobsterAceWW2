/*
    Class Name: SkyManager
    Description: Manages the sky
*/
class SkyManager {
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
        LOCAL_EVENT_HANDLER.addHandler("min_clouds_per_cluster", (eventDetails) => {
            this.cloudClusters.clear();
        });
        LOCAL_EVENT_HANDLER.addHandler("max_clouds_per_cluster", (eventDetails) => {
            this.cloudClusters.clear();
        });
    }

    /*
        Method Name: getSkyBrightness
        Method Parameters: None
        Method Description: Calculates the brightness of the sky
        Method Return: Number
    */
    getSkyBrightness(){
        return 1 - Math.abs(PROGRAM_DATA["sky_generation"]["current_hour"] - 12) / 12;
    }

    /*
        Method Name: getSkyTint
        Method Parameters: None
        Method Description: Determines the sky tint
        Method Return: Colour
    */
    getSkyTint(){
        let currentHour = PROGRAM_DATA["sky_generation"]["current_hour"];
        let colour;
        if (currentHour >= PROGRAM_DATA["sky_generation"]["sunrise_start"] && currentHour <= PROGRAM_DATA["sky_generation"]["sunrise_end"]){
            colour = Colour.fromCode(PROGRAM_DATA["sky_generation"]["sunrise_colour"])
            colour.modifyBrightness(PROGRAM_DATA["sky_generation"]["sunrise_modifier"]);
        }else if (currentHour >= PROGRAM_DATA["sky_generation"]["sunset_start"] && currentHour <= PROGRAM_DATA["sky_generation"]["sunset_end"]){
            colour = Colour.fromCode(PROGRAM_DATA["sky_generation"]["sunset_colour"])
            colour.modifyBrightness(PROGRAM_DATA["sky_generation"]["sunset_modifier"]);
        }else{
            colour = new Colour(0,0,0,0);
        }
        return colour;
    }

    /*
        Method Name: display
        Method Parameters:
            lX:
                The bottom left x displayed on the canvas relative to the focused entity
            bY:
                The bottom left y displayed on the canvas relative to the focused entity
        Method Description: Displays the sky and clouds
        Method Return: void
    */
    display(lX, bY){
        this.displaySky();
        this.displayClouds(lX, bY);
    }

    /*
        Method Name: displaySky
        Method Parameters:
            lX:
                The bottom left x displayed on the canvas relative to the focused entity
            bY:
                The bottom left y displayed on the canvas relative to the focused entity
        Method Description: Displays the sky
        Method Return: void
    */
    displaySky(){
        // Fill the entire screen with the sky background
        let skyColour = Colour.fromCode(PROGRAM_DATA["sky_generation"]["sky_colour"]);
        let skyBrightness = this.getSkyBrightness();
        let skyTint = this.getSkyTint();

        // Change brightness and tint
        skyColour.modifyBrightness(skyBrightness);
        skyColour.addColour(skyTint);

        let screenWidth = getScreenWidth();
        let screenHeight = getScreenHeight();

        // Fill screen with sky colour
        noStrokeRectangle(skyColour, 0, 0, screenWidth, screenHeight);
        
        let currentHour = PROGRAM_DATA["sky_generation"]["current_hour"];

        // Display the sun
        let sunColour = Colour.fromCode(PROGRAM_DATA["sky_generation"]["sun_colour"]);
        let sunDiameter = PROGRAM_DATA["sky_generation"]["sun_diameter"];
        
        let sunAngleDEG = fixDegrees(270 - 15 * currentHour);
        let sunAngleRadians = toRadians(sunAngleDEG);
        let sunX = Math.cos(sunAngleRadians) * (screenWidth-sunDiameter)/2 + screenWidth/2;
        let sunY = (Math.sin(sunAngleRadians) * (screenHeight-sunDiameter)/2 * -1) + screenHeight/2;
        // Only display sun if up
        if (sunY <= screenHeight/2){
            noStrokeCircle(sunColour, sunX, sunY, sunDiameter)
        }
        
        // Display the moon
        let moonPhase = PROGRAM_DATA["sky_generation"]["moon_phase"];
        // Ignore if new moon
        if (moonPhase != 4){
            let moonColour = Colour.fromCode(PROGRAM_DATA["sky_generation"]["moon_colour"]);
            let moonDiameter = PROGRAM_DATA["sky_generation"]["moon_diameter"];
            let moonAngleDEG = fixDegrees(90 - 15 * currentHour); 
            let moonAngleRadians = toRadians(moonAngleDEG);
            let moonX = Math.cos(moonAngleRadians) * (screenWidth-moonDiameter)/2 + screenWidth/2;
            let moonY = (Math.sin(moonAngleRadians) * (screenHeight-moonDiameter)/2 * -1) + screenHeight/2;
            // Only display sun if up
            if (moonY <= screenHeight/2){
                //console.log(moonColour)
                noStrokeCircle(moonColour, moonX, moonY, moonDiameter)
            }
            // Display the moon's shadow
            let shadowOffset = (-1 + 0.25 * moonPhase) * moonDiameter;
            if (moonY <= screenWidth/2){
                noStrokeCircle(skyColour, moonX + shadowOffset, moonY, moonDiameter)
            }      
        }
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
    displayClouds(lX, bY){
        let rX = lX + getZoomedScreenWidth() - 1;
        let tY = bY + getZoomedScreenHeight() - 1;

        // Adjusted because of clouds sticking outside their zones
        // Note: The * 2 used to just as safeguard because sometimes floats are iffy I don't want clouds popping away
        let lXAdjusted = lX - PROGRAM_DATA["sky_generation"]["cloud_generation"]["max_radius"] * 2;
        let rXAdjusted = rX + PROGRAM_DATA["sky_generation"]["cloud_generation"]["max_radius"] * 2;
        let bYAdjusted = bY - PROGRAM_DATA["sky_generation"]["cloud_generation"]["max_radius"] * 2;
        let tYAdjusted = tY + PROGRAM_DATA["sky_generation"]["cloud_generation"]["max_radius"] * 2;

        let leftClusterX = Math.floor(lXAdjusted / PROGRAM_DATA["sky_generation"]["cloud_generation"]["cloud_cluster_width"]);
        let rightClusterX = Math.floor(rXAdjusted / PROGRAM_DATA["sky_generation"]["cloud_generation"]["cloud_cluster_width"]);
        let bottomClusterY = Math.floor(bYAdjusted / PROGRAM_DATA["sky_generation"]["cloud_generation"]["cloud_cluster_height"]);
        let topClusterY = Math.floor(tYAdjusted / PROGRAM_DATA["sky_generation"]["cloud_generation"]["cloud_cluster_height"]);

        // Loop though all clusters and display
        for (let clusterX = leftClusterX; clusterX <= rightClusterX; clusterX++){
            for (let clusterY = bottomClusterY; clusterY <= topClusterY; clusterY++){
                this.getCloudCluster(clusterX, clusterY).display(lX, bY);
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
        let cX = lX + 0.5 * getZoomedScreenWidth();
        let cY = bY + 0.5 * getZoomedScreenHeight();
        for (let i = this.cloudClusters.getLength() - 1; i >= 0; i--){
            let cluster = this.cloudClusters.get(i);
            let distance = Math.sqrt(Math.pow(cluster.getQuadrantX() * PROGRAM_DATA["sky_generation"]["cloud_generation"]["cloud_cluster_width"] - cX, 2) + Math.pow(cluster.getQuadrantY() * PROGRAM_DATA["sky_generation"]["cloud_generation"]["cloud_cluster_height"] - cY, 2));
            // Delete clusters more than 2 times max(width, height) away from the center of the screen
            if (distance > PROGRAM_DATA["sky_generation"]["far_away_multiplier"] * Math.max(PROGRAM_DATA["sky_generation"]["cloud_generation"]["cloud_cluster_width"], PROGRAM_DATA["sky_generation"]["cloud_generation"]["cloud_cluster_height"])){
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
        let leftX = this.quadrantX * PROGRAM_DATA["sky_generation"]["cloud_generation"]["cloud_cluster_width"];
        let bottomY = this.quadrantY * PROGRAM_DATA["sky_generation"]["cloud_generation"]["cloud_cluster_height"];
        let seed = this.quadrantX + 2 * this.quadrantY; // TODO: Come up with something better?
        let random = new SeededRandomizer(seed);
        let minClouds = PROGRAM_DATA["sky_generation"]["cloud_generation"]["min_clouds_per_cluster"];
        let maxClouds = PROGRAM_DATA["sky_generation"]["cloud_generation"]["max_clouds_per_cluster"];
        let numClouds = random.getIntInRangeInclusive(minClouds, maxClouds);
        // Create as many clouds as chosen
        for (let i = 0; i < numClouds; i++){
            let newCloudX = random.getIntInRangeExclusive(leftX, leftX + PROGRAM_DATA["sky_generation"]["cloud_generation"]["cloud_cluster_width"]);
            let newCloudY = random.getIntInRangeExclusive(bottomY, bottomY + PROGRAM_DATA["sky_generation"]["cloud_generation"]["cloud_cluster_height"]);
            // Skip clouds under min height
            if (newCloudY < PROGRAM_DATA["sky_generation"]["cloud_generation"]["min_height"]){ continue; }
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
            let cloudColour = Colour.fromCode(PROGRAM_DATA["sky_generation"]["cloud_generation"]["cloud_colour"]);
            cloudColour.setAlpha(PROGRAM_DATA["sky_generation"]["cloud_generation"]["cloud_opacity"]/100);
            // Display the circle
            noStrokeCircle(cloudColour, screenX, screenY, circleObject["radius"]*2*gameZoom);
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
        let numCircles = random.getIntInRangeInclusive(PROGRAM_DATA["sky_generation"]["cloud_generation"]["min_circles_per_cloud"], PROGRAM_DATA["sky_generation"]["cloud_generation"]["max_circles_per_cloud"]);
        let mainRadius = random.getIntInRangeInclusive(PROGRAM_DATA["sky_generation"]["cloud_generation"]["min_radius"], PROGRAM_DATA["sky_generation"]["cloud_generation"]["max_radius"]);
        circles.push({"x": x, "y": y, "radius": mainRadius});
        for (let i = 0; i < numCircles - 1; i++){
            let circleX = x + random.getIntInRangeInclusive(-1 * mainRadius, mainRadius);
            let circleY = y + random.getIntInRangeInclusive(-1 * mainRadius, mainRadius);
            let circleRadius = random.getIntInRangeInclusive(PROGRAM_DATA["sky_generation"]["cloud_generation"]["min_radius"], PROGRAM_DATA["sky_generation"]["cloud_generation"]["max_radius"]);
            circles.push({"x": circleX, "y": circleY, "radius": circleRadius});
        }
        return new Cloud(circles, scene);
    }
}