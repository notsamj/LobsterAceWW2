if (typeof window === "undefined"){
    NotSamLinkedList = require("../scripts/notsam_linked_list.js");
    NotSamArrayList = require("../scripts/notsam_array_list.js");
    planeModelToAlliance = require("../scripts/helper_functions.js").planeModelToAlliance;
}
class TeamCombatManager {
    constructor(teams){
        this.planes = {};
        this.bullets = {};
        this.teams = teams;
        this.clear();
    }

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

    clear(){
        for (let team of this.teams){
            this.planes[team] = new NotSamLinkedList();
            this.bullets[team] = new NotSamArrayList(null, fileData["constants"]["MAX_BULLETS"]);
        }
    }

    addEntity(entity){
        if (entity instanceof Plane){
            this.addPlane(entity);
        }else if (entity instanceof Bullet){
            this.addBullet(entity);
        }
    }

    hasEntity(entityID){
        return this.getEntity(entityID) != null;
    }

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

    addPlane(plane){
        let team = planeModelToAlliance(plane.getPlaneClass());
        let planeLL = this.planes[team];
        let newID = planeLL.getLength();
        plane.setID("p" + "_" + team + "_" + newID);
        planeLL.push(plane);
    }

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

    checkCollisions(timeDiff){
        for (let team of this.teams){
            for (let otherTeam of this.teams){
                if (team == otherTeam){ continue; }
                this.checkBulletCollisionsFromTeamToTeam(team, otherTeam, timeDiff);
            }
        }
    }

    checkBulletCollisionsFromTeamToTeam(team, otherTeam, timeDiff){
        for (let [bullet, bIndex] of this.bullets[team]){
            if (bullet.isDead()){ continue; }
            for (let [plane, pIndex] of this.planes[otherTeam]){
                if (plane.isDead()){ continue; }
                if (bullet.collidesWith(plane, timeDiff)){
                    plane.damage(1);
                    bullet.die();
                    break;
                }
            }
        }
    }

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

    displayAll(scene, lX, bY, excludeID){
        for (let team of this.teams){
            for (let [plane, pIndex] of this.planes[team]){
                if (!plane.isDead() && plane.getID() != excludeID){
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

    displayEntity(scene, entity, lX, bY){
        scene.displayEntity(entity, lX, bY);
    }

    countAlliance(allianceName){
        let aliveCount = 0;
        for (let [plane, pIndex] of this.planes[allianceName]){
            if (!plane.isDead()){
                aliveCount++;
            }
        }
        return aliveCount;
    }
}
if (typeof window === "undefined"){
    module.exports = TeamCombatManager;
}