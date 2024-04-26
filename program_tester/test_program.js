const TestDogfight = require("./test_dogfight.js");
const TestMission = require("./test_mission.js");

const ProgramTester = require("../scripts/general/program_tester.js");

function testDogfight(){
    let dogfightJSON = {
        "ally_difficulty": "hardest",
        "axis_difficulty": "hardest",
        "bullet_physics_enabled": true,
        "plane_counts": {
            "b24": 10,
            "me_264": 15
        }
    }
    let winners = {"Axis": 0, "Allies": 0};
    let count = 100;
    let crazyLimit = 20 * 60 * 10; // 10 minutes
    console.log("Running:", dogfightJSON)
    for (let i = 0; i < count; i++){
        console.log("Running test:", i+1, "/", count);
        let testFight = new TestDogfight(dogfightJSON);
        while (testFight.isRunning() && testFight.getNumTicks() < crazyLimit){
            testFight.tick();
        }
        // If timed out
        if (testFight.getNumTicks() >= crazyLimit){
            console.log("Timed out.")
        }else{
            winners[testFight.getStatsManager().getWinner()] += 1;
            console.log("Test over, ticks:", testFight.getNumTicks(), winners);
        }
    }
    console.log(winners)
}

function testMission(){
    let missionJSON = {
        "ally_difficulty": "easy",
        "axis_difficulty": "easy",
        "mission_id": 0,
        "bullet_physics_enabled": true,
        "users": []
    }
    let winners = {"Axis": 0, "Allies": 0};
    let count = 30;
    let crazyLimit = 20 * 60 * 10; // 10 minutes
    console.log("Running:", missionJSON)
    for (let i = 0; i < count; i++){
        console.log("Running test:", i+1, "/", count);
        let testFight = new TestMission(missionJSON);
        while (testFight.isRunning() && testFight.getNumTicks() < crazyLimit){
            testFight.tick();
        };
        // If timed out
        if (testFight.getNumTicks() >= crazyLimit){
            console.log(testFight);
            break;
        }else{
            winners[testFight.getStatsManager().getWinner()] += 1
            console.log("Test over, ticks:", testFight.getNumTicks(), winners);
        }
    }
    console.log(winners)
}


// Test a dogfight
testDogfight();

// Test a mission
//testMission();