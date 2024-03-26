// When this is opened in NodeJS, import the required files
if (typeof window === "undefined"){
    NotSamLinkedList = require("./general/notsam_linked_list.js");
    NotSamArrayList = require("./general/notsam_array_list.js");
    planeModelToAlliance = require("./general/helper_functions.js").planeModelToAlliance;
    AfterMatchStats = require("./after_match_stats.js");
}
/*
    Class Name: TeamCombatManager
    Description: A class that manage planes and bullets in a dogfight.
*/
class TeamCombatManager {
    /*
        Method Name: constructor
        Method Parameters:
            teams:
                The names of the alliances
            scene:
                A plane game scene
        Method Description: Constructor
        Method Return: Constructor
    */
    constructor(teams, scene){
        this.planes = {};
        this.bullets = {};
        this.buildings = new NotSamLinkedList();
        this.bombs = new NotSamArrayList(null, PROGRAM_DATA["settings"]["max_bombs"]);
        this.teams = teams;
        this.stats = new AfterMatchStats();
        this.scene = scene;
        for (let team of teams){
            this.planes[team] = new NotSamLinkedList();
            this.bullets[team] = new NotSamArrayList(null, PROGRAM_DATA["settings"]["max_bullets"]);
        }
    }

    // TODO: Comments
    getAllPlanesFromAlliance(allianceName){
        return this.planes[allianceName];
    }

    // TODO: Comments
    setStatsManager(statsManager){
        this.stats = statsManager;
    }

    /*
        Method Name: clear
        Method Parameters: None
        Method Description: Removes all planes and all bullets
        Method Return: void
    */
    clear(){
        this.clearPlanes();
        this.clearBullets();
        this.buildings.clear();
        this.bombs.clear();
    }

    /*
        Method Name: clearPlanes
        Method Parameters: None
        Method Description: Removes all planes
        Method Return: void
    */
    clearPlanes(){
        for (let team of this.teams){
            this.planes[team].clear();
        }
    }

    /*
        Method Name: clearBullets
        Method Parameters: None
        Method Description: Removes all bullets
        Method Return: void
    */
    clearBullets(){
        for (let team of this.teams){
            this.bullets[team].clear();
        }
    }

    /*
        Method Name: addEntity
        Method Parameters:
            entity:
                Plane or bullet or bomb or a building
        Method Description: Adds either a plane or a bullet or a bomb or a building
        Method Return: void
    */
    addEntity(entity){
        if (entity instanceof Plane){
            this.addPlane(entity);
        }else if (entity instanceof Bullet){
            this.addBullet(entity);
        }else if (entity instanceof Bomb){
            this.addBomb(entity);
        }else if (entity instanceof Building){
            this.addBuilding(entity);
        }
    }

    /*
        Method Name: hasEntity
        Method Parameters:
            entityID:
                ID of an entity
        Method Description: Determines if it contains an entity with the provided ID
        Method Return: boolean, true -> has entity, false -> does not have entity
    */
    hasEntity(entityID){
        return this.getEntity(entityID) != null;
    }

    /*
        Method Name: getEntity
        Method Parameters:
            entityID:
                The id of an entity
        Method Description: Finds an entity if it exists
        Method Return: Entity
    */
    getEntity(entityID){
        for (let team of this.teams){
            for (let [plane, pIndex] of this.planes[team]){
                if (plane.getID() == entityID){
                    return plane;
                }
            }
            for (let [bullet, bIndex] of this.bullets[team]){
                if (bullet.getID() == entityID){
                    return bullet;
                }
            }
        }
        return null;
    }

    /*
        Method Name: addPlane
        Method Parameters:
            plane:
                A plane to add
        Method Description: Adds a plane to the list of planes, also sets the ID
        Method Return: void
    */
    addPlane(plane){
        let team = planeModelToAlliance(plane.getPlaneClass());
        let planeLL = this.planes[team];
        let newID = planeLL.getLength();
        if (plane.getID() == null){
            plane.setID("p" + "_" + team + "_" + newID);
        }
        planeLL.push(plane);
    }

    // TODO: Comments
    addBuilding(building){
        building.setID("building_" + this.buildings.getLength());
        this.buildings.push(building);
    }

    // TODO: Comments
    getBuildings(){
        return this.buildings;
    }

    /*
        Method Name: addBomb
        Method Parameters:
            bomb:
                A bomb to add
        Method Description: Adds a bomb to the list of bombs, also sets the ID
        Method Return: void
    */
    addBomb(bomb){
        let bombArray = this.bombs;
        for (let [exisitingBomb, index] of bombArray){
            if (exisitingBomb.isDead()){
                bomb.setID("b" + "_" + index);
                bomb.setIndex(index);
                bombArray.put(index, bomb);
                return;
            }
        }
        // No empty spaces found...
        if (bombArray.getLength() < bombArray.getSize()){
            let bombIndex = bombArray.getLength();
            bomb.setID("bomb"+ "_" + bombIndex);
            bomb.setIndex(bombIndex);
            bombArray.append(bomb);
        }
    }

    /*
        Method Name: addBullet
        Method Parameters:
            bullet:
                A bullet to add
        Method Description: Adds a bullet to the list of bullets, also sets the ID
        Method Return: void
    */
    addBullet(bullet){
        let team = bullet.getAlliance();
        let bulletArray = this.bullets[team];
        for (let [existingBullet, index] of bulletArray){
            if (existingBullet.isDead()){
                bullet.setID("b" + "_" + bullet.getAlliance() + "_" + index);
                bullet.setIndex(index);
                bulletArray.put(index, bullet);
                return;
            }
        }
        // No empty spaces found...
        if (bulletArray.getLength() < bulletArray.getSize()){
            let bulletIndex = bulletArray.getLength();
            bullet.setID("b"+ "_" + bullet.getAlliance() + "_" + bulletIndex);
            bullet.setIndex(bulletIndex);
            bulletArray.append(bullet);
        }
    }

    /*
        Method Name: tick
        Method Parameters:
            timeDiff:
                Time between ticks
        Method Description: Makes things happen within a tick
        Method Return: void
    */
    async tick(timeDiff){
        for (let team of this.teams){
            
            for (let [plane, pIndex] of this.planes[team]){
                if (plane.isDead()){ continue; }
                await plane.tick(timeDiff);
            }

            for (let [bullet, bIndex] of this.bullets[team]){
                if (bullet.isDead()){ continue; }
                await bullet.tick(timeDiff);
            }
        }
        for (let [bomb, bombIndex] of this.bombs){
            if (bomb.isDead()){ continue; }
            await bomb.tick(timeDiff);
        }
        this.checkCollisions(timeDiff);
    }

    /*
        Method Name: checkCollisions
        Method Parameters:
            timeDiff:
                Time between ticks
        Method Description: Checks for collisions between planes and bullets
        Method Return: void
    */
    checkCollisions(timeDiff){
        let previousTick = this.scene.getGamemode().getNumTicks()-1;
        // No collisions on tick 0
        if (previousTick < 0){ return; }
        // No collisions in testing
        this.checkBulletCollisionsWithWorldBorder();

        // Check ally and axis bullet hits
        for (let team of this.teams){
            for (let otherTeam of this.teams){
                if (team == otherTeam){ continue; }
                this.checkBulletCollisionsFromTeamToTeam(team, otherTeam, timeDiff);
            }
        }

        // For each bomb check each building for collisions
        for (let [bomb, bombIndex] of this.bombs){
            if (bomb.isDead()){ continue; }
            for (let [building, buildingIndex] of this.buildings){
                if (building.isDead()){ continue; }
                if (Bullet.checkForProjectileLinearCollision(bomb, building, previousTick)){
                    building.damage(1);
                    bomb.die();
                    break;
                }
            }
        }
    }

    checkBulletCollisionsWithWorldBorder(){
        let planesLeftX = Number.MAX_SAFE_INTEGER;
        let planesRightX = Number.MIN_SAFE_INTEGER;
        let planesTopY = Number.MIN_SAFE_INTEGER;
        let planesBottomY = Number.MAX_SAFE_INTEGER;

        // Check all planes
        for (let team of this.teams){
            for (let [plane, pIndex] of this.planes[team]){
                if (plane.isDead()){ continue; }
                planesLeftX = Math.min(plane.getX(), planesLeftX);
                planesRightX = Math.max(plane.getX(), planesRightX);
                planesTopY = Math.max(plane.getY(), planesTopY);
                planesBottomY = Math.min(plane.getY(), planesBottomY);
            }
        }

        // Check all bullets
        for (let team of this.teams){
            for (let [bullet, bIndex] of this.bullets[team]){
                if (bullet.isDead()){ continue; }
                let bX = bullet.getX();
                let bY = bullet.getY();
                let tooFarToTheLeftOrRight = bX + PROGRAM_DATA["settings"]["expected_canvas_width"] < planesLeftX || bX - PROGRAM_DATA["settings"]["expected_canvas_width"] > planesRightX;
                let tooFarToUpOrDown = bY + PROGRAM_DATA["settings"]["expected_canvas_height"] < planesBottomY || bY - PROGRAM_DATA["settings"]["expected_canvas_height"] > planesTopY;
                if (tooFarToUpOrDown || tooFarToTheLeftOrRight){
                    bullet.die();
                }
            }
        }

    }

    /*
        Method Name: checkBulletCollisionsFromTeamToTeam
        Method Parameters:
            team:
                An alliance
            otherTeam:
                Another alliance
            timeDiff:
                Time between ticks
        Method Description: Checks for collisions between planes of 'team' and bullets of 'otherTeam' and other things to determine if bullet is worth keeping aroun
        Method Return: void
    */
    checkBulletCollisionsFromTeamToTeam(team, otherTeam, timeDiff){
        // Check for bullet too far from planes
        let planesLeftX = Number.MAX_SAFE_INTEGER;
        let planesRightX = Number.MIN_SAFE_INTEGER;
        let planesTopY = Number.MIN_SAFE_INTEGER;
        let planesBottomY = Number.MAX_SAFE_INTEGER;

        // Determine border of all planes of team A
        for (let [plane, pIndex] of this.planes[otherTeam]){
            if (plane.isDead()){ continue; }
            planesLeftX = Math.min(plane.getX(), planesLeftX);
            planesRightX = Math.max(plane.getX(), planesRightX);
            planesTopY = Math.max(plane.getY(), planesTopY);
            planesBottomY = Math.min(plane.getY(), planesBottomY);
            //console.log(planesLeftX,planesRightX,planesTopY,planesBottomY)
        }

        // For each team B bullet if far from the border of team A plane then ignore
        let ignoreBulletsCheck1 = [];
        for (let [bullet, bIndex] of this.bullets[team]){
            ignoreBulletsCheck1.push(false);
            let bX = bullet.getX();
            let bY = bullet.getY();
            // If too far left
            if (bX < planesLeftX - PROGRAM_DATA["settings"]["expected_canvas_width"]){
                ignoreBulletsCheck1[bIndex] = true;
                continue;
            }
            // If too far right
            if (bX > planesRightX + PROGRAM_DATA["settings"]["expected_canvas_width"]){
                ignoreBulletsCheck1[bIndex] = true;
                continue;
            }
            // If too low
            if (bY < planesBottomY - PROGRAM_DATA["settings"]["expected_canvas_height"]){
                ignoreBulletsCheck1[bIndex] = true;
                continue;
            }
            // If too high
            if (bY > planesTopY + PROGRAM_DATA["settings"]["expected_canvas_height"]){
                ignoreBulletsCheck1[bIndex] = true;
                continue;
            }
        }

        let currentTick = this.scene.getGamemode().getNumTicks();
        let previousTick = currentTick - 1;

        // Make simple bullet data
        let simpleBulletData = [];
        for (let [bullet, bIndex] of this.bullets[team]){
            if (bullet.isDead() || ignoreBulletsCheck1[bIndex]){ simpleBulletData.push({}); continue; }
            let x1 = bullet.getXAtTick(previousTick);
            let x2 = bullet.getXAtTick(currentTick);
            let y1 = bullet.getYAtTick(previousTick);
            let y2 = bullet.getYAtTick(currentTick);
            let leftX = Math.min(x1, x2);
            let rightX = Math.max(x1, x2);
            let topY = Math.max(y1, y2);
            let bottomY = Math.min(y1, y2);
            simpleBulletData.push({"lX": leftX, "rX": rightX, "bY": bottomY, "tY": topY});
        }

        // Loop through planes to look for collision
        for (let [plane, pIndex] of this.planes[otherTeam]){
            if (plane.isDead()){ continue; }
            let x1 = plane.getXAtStartOfTick();
            let x2 = plane.getX();
            let y1 = plane.getYAtStartOfTick();
            let y2 = plane.getY();
            let leftX = Math.min(x1, x2);
            let rightX = Math.max(x1, x2);
            let topY = Math.max(y1, y2);
            let bottomY = Math.min(y1, y2);
            let simplePlaneData = {"lX": leftX, "rX": rightX, "bY": bottomY, "tY": topY};
            for (let [bullet, bIndex] of this.bullets[team]){
                if (bullet.isDead() || ignoreBulletsCheck1[bIndex]){ continue; }
                //console.log("Checking1")
                if (bullet.collidesWithPlane(plane, timeDiff, simpleBulletData[bIndex], simplePlaneData)){
                    plane.damage(1);
                    bullet.die();
                    if (plane.isDead()){
                        this.handleKill(bullet, plane);
                        break;
                    }
                }
            }
        }
    }

    /*
        Method Name: getNumberOfEntities
        Method Parameters: None
        Method Description: Determines the number of entities that exist
        Method Return: int
    */
    getNumberOfEntities(){
        let count = 0;
        for (let team of this.teams){
            for (let [plane, pIndex] of this.planes[team]){
                if (!plane.isDead()){
                    count++;
                }
            }
            for (let [bullet, bIndex] of this.bullets[team]){
                if (!bullet.isDead()){
                    count++;
                }
            }
        }
        return count;
    }

    /*
        Method Name: displayAll
        Method Parameters:
            scene:
                Scene on which to display entities
            lX:
                Lower x bound of the displayed area
            bY:
                Lower y bound of the displayed area
            excludeID:
                Entity to exclude from display
            displayTime:
                The time used to interpolate the positions of the planes
        Method Description: Displays all entities that aren't excluded
        Method Return: void
    */
    displayAll(scene, lX, bY, excludeID, displayTime){
        for (let team of this.teams){
            for (let [plane, pIndex] of this.planes[team]){
                //if (!plane.isDead() && plane.getID() != excludeID){
                //console.log("Going to display", plane.getID() != excludeID, plane.getID())
                if (plane.getID() != excludeID){
                    plane.display(lX, bY, displayTime);
                }
            }
        }

        for (let team of this.teams){
            for (let [bullet, bIndex] of this.bullets[team]){
                if (!bullet.isDead() && bullet.getID() != excludeID){
                    bullet.display(lX, bY, displayTime);
                }
            }
        }

        for (let [building, buildingIndex] of this.buildings){
            building.display(lX, bY, displayTime);
        }

        for (let [bomb, bombIndex] of this.bombs){
            bomb.display(lX, bY, displayTime);
        }
    }

    /*
        Method Name: getLivingPlanes
        Method Parameters: None
        Method Description: Gathers a list of all living planes
        Method Return: List of Plane
    */
    getLivingPlanes(){
        let planes = [];
        for (let team of this.teams){
            for (let [plane, pIndex] of this.planes[team]){
                if (!plane.isDead()){
                    planes.push(plane);
                }
            }
        }
        return planes;
    }

    /*
        Method Name: getAllPlanes
        Method Parameters: None
        Method Description: Gathers a list of all planes
        Method Return: List of Plane
    */
    getAllPlanes(){
        let planes = [];
        for (let team of this.teams){
            for (let [plane, pIndex] of this.planes[team]){
                planes.push(plane);
            }
        }
        return planes;
    }

    /*
        Method Name: getDeadPlanes
        Method Parameters: None
        Method Description: Find all the dead planes
        Method Return: List of Plane
    */
    getDeadPlanes(){
        let planes = [];
        for (let team of this.teams){
            for (let [plane, pIndex] of this.planes[team]){
                if (plane.isDead()){
                    planes.push(plane);
                }
            }
        }
        return planes;
    }

    /*
        Method Name: getAllBullets
        Method Parameters: None
        Method Description: Gathers a list of all living bullets
        Method Return: List of Bullets
    */
    getAllBullets(){
        let bullets = [];
        for (let team of this.teams){
            for (let [bullet, bIndex] of this.bullets[team]){
                if (!bullet.isDead()){
                    bullets.push(bullet);
                }
            }
        }
        return bullets;
    }

    // TODO: Comments
    getBombs(){
        return this.bombs;
    }

    /*
        Method Name: countAlliance
        Method Parameters:
            allianceName:
                Team of an alliance
        Method Description: Counts living entities of an alliance
        Method Return: int
    */
    countAlliance(allianceName){
        let aliveCount = 0;
        for (let [plane, pIndex] of this.planes[allianceName]){
            if (!plane.isDead()){
                aliveCount++;
            }
        }
        return aliveCount;
    }

    /*
        Method Name: handleKill
        Method Parameters:
            bullet:
                A bullet that kills a plane
            deadPlane:
                A plane that is dying
        Method Description: Records a kill that takes place
        Method Return: void
    */
    handleKill(bullet, deadPlane){
        let shooter = this.getEntity(bullet.getShooterID());
        // If human 
        if (shooter.isHuman()){
            this.stats.addPlayerKill(shooter.getID(), planeModelToAlliance(shooter.getPlaneClass()));
        }else{
            this.stats.addBotKill(shooter.getPlaneClass());
        }
    }

    // TODO: Comments
    getPlane(id){
        for (let plane of this.getAllPlanes()){
            if (plane.getID() == id){
                return plane;
            }
        }
        return null;
    }

    // TODO: Comments
    getPlaneJSON(){
        let planeJSON = [];
        for (let team of this.teams){
            for (let [plane, pIndex] of this.planes[team]){
                planeJSON.push(plane.toJSON());
            }
        }
        return planeJSON;
    }

    // TODO: Comments
    getBulletJSON(){
        let bulletJSON = [];
        for (let bullet of this.getAllBullets()){
            bulletJSON.push(bullet.toJSON());
        }
        return bulletJSON;
    }

    // TODO: Comments
    getBombJSON(){
        let bombJSON = [];
        for (let [bomb, bombIndex] of this.bombs){
            bombJSON.push(bomb.toJSON());
        }
        return bombJSON;
    }

    // TODO: Comments
    getBuildingJSON(){
        let buildingJSON = [];
        for (let [building, buildingIndex] of this.buildings){
            buildingJSON.push(building.toJSON());
        }
        return buildingJSON;
    }
    
    // TODO: Comments
    fromBuildingJSON(buildingsJSON){
        let index = 0;
        for (let buildingJSON of buildingsJSON){
            // Add building or set stats from JSON 
            if (index >= this.buildings.getLength()){
                //console.log("Push", index, this.buildings.getLength())
                this.buildings.push(Building.fromJSON(buildingJSON, this.scene));
            }else{
                //console.log(this.buildings.getLength(), index, this.buildings.get(index));
                this.buildings.get(index).fromJSON(buildingJSON, this.scene);
            }
            index++;
        }
    }

    // TODO: Comments
    fromBombJSON(bombsJSON){
        for (let bombJSON of bombsJSON){
            let index = bombJSON["index"];
            // Add bomb 
            if (index >= this.bombs.getLength()){
                this.bombs.push(Bomb.fromJSON(bombJSON, this.scene));
            }else{
                let test = this.bombs;
                let bomb = this.bombs.get(index);
                if (bomb == null){
                    debugger;
                }
                console.log("bomb", bomb, bomb == null, bomb === null)
                bomb.fromJSON(bombJSON, this.scene);
            }
        }
    }

    // TODO: Comments
    fromBulletJSON(bulletsJSON){
        for (let bulletJSON of bulletsJSON){
            let allianceName = planeModelToAlliance(bulletJSON["shooter_class"]);
            let index = bulletJSON["index"];
            // Add bullet 
            if (index >= this.bullets[allianceName].getLength()){
                this.bullets[allianceName].push(Bullet.fromJSON(bulletJSON, this.scene));
                //c++;
            }else{
                //console.log(index, this.bullets[allianceName].getLength(), this.bullets[allianceName].get(index))
                this.bullets[allianceName].get(index).fromJSON(bulletJSON, this.scene);
                //c2++;
            }
        }
        //console.log(c, c2);
    }
}
// If using NodeJS -> export the class
if (typeof window === "undefined"){
    module.exports = TeamCombatManager;
}