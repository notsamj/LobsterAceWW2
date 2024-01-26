// When this is opened in NodeJS, import the required files
if (typeof window === "undefined"){
    NotSamLinkedList = require("../scripts/notsam_linked_list.js");
    NotSamArrayList = require("../scripts/notsam_array_list.js");
    planeModelToAlliance = require("../scripts/helper_functions.js").planeModelToAlliance;
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
        Method Description: Constructor
        Method Return: Constructor
    */
    constructor(teams){
        this.planes = {};
        this.bullets = {};
        this.teams = teams;
        this.clear();
    }

    /*
        Method Name: forceUpdatePlanes
        Method Parameters:
            listOfPlaneObjects:
                A list of plane objects
        Method Description: Updates planes based on information about them in the JSON object
        Method Return: void
    */
    forceUpdatePlanes(listOfPlaneObjects){
        for (let team of this.teams){
            for (let [plane, planeIndex] of this.planes[team]){
                let foundOBJ = null;
                for (let planeOBJ of listOfPlaneObjects){
                    if (planeOBJ["id"] == plane.getID()){
                        foundOBJ = planeOBJ;
                        break;
                    }
                }
                if (foundOBJ == null){
                    console.error("Plane not found!");
                    debugger;
                    continue;
                }
                // Else found
                if (foundOBJ["isDead"] && plane.isDead()){ continue; }
                plane.update(foundOBJ);
            }
        }
    }

    /*
        Method Name: clear
        Method Parameters: None
        Method Description: Removes all planes and all bullets
        Method Return: void
    */
    clear(){
        for (let team of this.teams){
            this.planes[team] = new NotSamLinkedList();
            this.bullets[team] = new NotSamArrayList(null, FILE_DATA["constants"]["MAX_BULLETS"]);
        }
    }

    /*
        Method Name: addEntity
        Method Parameters:
            entity:
                Plane or bullet
        Method Description: Adds either a plane or a bullet
        Method Return: void
    */
    addEntity(entity){
        if (entity instanceof Plane){
            this.addPlane(entity);
        }else if (entity instanceof Bullet){
            this.addBullet(entity);
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
                bulletArray.put(index, bullet);
                return;
            }
        }
        // No empty spaces found...
        if (bulletArray.getLength() < bulletArray.getSize()){
            bullet.setID("b"+ "_" + bullet.getAlliance() + "_" + bulletArray.getLength());
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
        for (let team of this.teams){
            for (let otherTeam of this.teams){
                if (team == otherTeam){ continue; }
                this.checkBulletCollisionsFromTeamToTeam(team, otherTeam, timeDiff);
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
        Method Description: Checks for collisions between planes of 'team' and bullets of 'otherTeam'
        Method Return: void
    */
    checkBulletCollisionsFromTeamToTeam(team, otherTeam, timeDiff){
        for (let [bullet, bIndex] of this.bullets[team]){
            if (bullet.isDead()){ continue; }
            for (let [plane, pIndex] of this.planes[otherTeam]){
                if (plane.isDead()){ continue; }
                if (bullet.collidesWith(plane, timeDiff)){
                    plane.damage(1);
                    if (plane.isDead()){
                        this.handleKill(bullet, plane);
                    }
                    bullet.die();
                    break;
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
        Method Description: Displays all entities that aren't excluded
        Method Return: void
    */
    displayAll(scene, lX, bY, excludeID){
        for (let team of this.teams){
            for (let [plane, pIndex] of this.planes[team]){
                //if (!plane.isDead() && plane.getID() != excludeID){
                if (plane.getID() != excludeID){
                    this.displayEntity(scene, plane, lX, bY);
                }
            }
        }

        for (let team of this.teams){
            for (let [bullet, bIndex] of this.bullets[team]){
                if (!bullet.isDead() && bullet.getID() != excludeID){
                    this.displayEntity(scene, bullet, lX, bY);
                }
            }
        }
    }

    /*
        Method Name: getAllPlanes
        Method Parameters: None
        Method Description: Gathers a list of all living planes
        Method Return: List of Planes
    */
    getAllPlanes(){
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

    /*
        Method Name: displayAll
        Method Parameters:
            scene:
                Scene on which to display entities
            entity:
                Entity to display
            lX:
                Lower x bound of the displayed area
            bY:
                Lower y bound of the displayed area
        Method Description: Displays an entity
        Method Return: void
    */
    displayEntity(scene, entity, lX, bY){
        scene.displayEntity(entity, lX, bY);
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
            AfterMatchStats.addPlayerKill(planeModelToAlliance(shooter.getPlaneClass()));
        }else{
            AfterMatchStats.addBotKill(shooter.getPlaneClass());
        }
    }
}
// If using NodeJS -> export the class
if (typeof window === "undefined"){
    module.exports = TeamCombatManager;
}