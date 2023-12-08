function copyArray(array){
    let newArray = [];
    for (let i = 0; i < array.length; i++){
        newArray.push(array[i]);
    }
    return newArray;
}

function toRadians(degrees){
    return degrees * Math.PI / 180;
}

function toDegrees(radians){
    return radians / (2 * Math.PI) * 360;
}

function fixDegrees(angle){
    let infiniteLoopFinder = new InfiniteLoopFinder(500, "fixDegrees");
    while (angle < 0){
        angle += 360;
        infiniteLoopFinder.count();
    }
    infiniteLoopFinder.reset();
    while(angle >= 360){
        angle -= 360;
        infiniteLoopFinder.count();
    }
    return angle;
}

function fixRadians(angle){
    let infiniteLoopFinder = new InfiniteLoopFinder(500, "fixRadians");
    while (angle < 0){
        angle += 2 * Math.PI;
        infiniteLoopFinder.count();
    }
    infiniteLoopFinder.reset();
    while (angle >= 2 * Math.PI){
        angle -= Math.PI;
        infiniteLoopFinder.count();
    }
    return angle;
}

function displacementToDegrees(dX, dY){
    return fixDegrees(toDegrees(displacmentToRadians(dX, dY)));
}

function displacmentToRadians(dX, dY){
    // Handle incredibly small displacements
    if (Math.abs(dY) < 1){
        return (dX >= 0) ? toRadians(0) : toRadians(180);
    }else if (Math.abs(dX) < 1){
        return (dY >= 0) ? toRadians(90) : toRadians(270);
    }

    // Convert angle to positive positive
    let angleRAD = Math.atan(Math.abs(dY) / Math.abs(dX));

    // If -,- (x,y)
    if (dX < 0 && dY < 0){
        angleRAD = Math.PI + angleRAD;
    // If -,+ (x,y)
    }else if (dX < 0 && dY > 0){
        angleRAD = Math.PI - angleRAD;
    // If +,- (x,y)
    }else if (dX > 0 && dY < 0){
        angleRAD = 2 * Math.PI - angleRAD;
    }
    // +,+ Needs no modification
    return angleRAD;
}

function randomNumberInclusive(min, maxInclusive){
    return Math.floor(Math.random() * (maxInclusive - min + 1)) + min; 
}

function randomNumber(maxExclusive){
    return randomNumberInclusive(0, maxExclusive-1);
}

function onSameTeam(class1, class2){
    return countryToAlliance(fileData["plane_data"][class1]["country"]) == countryToAlliance(fileData["plane_data"][class2]["country"]);
}

function calculateAngleDiffDEG(angle1, angle2){
    let diff = Math.max(angle1, angle2) - Math.min(angle1, angle2);
    let infiniteLoopFinder = new InfiniteLoopFinder(500, "calculateAngleDiffDEG");
    if (diff > 180){
        diff = 360 - diff;
        infiniteLoopFinder.count();
    }
    return diff;
}

function calculateAngleDiffDEGCW(angle1, angle2){
    angle1 = Math.floor(angle1);
    angle2 = Math.floor(angle2);
    let diff = 0;
    let infiniteLoopFinder = new InfiniteLoopFinder(500, "calculateAngleDiffDEGCW");
    while (angle1 != Math.floor(angle2)){
        angle1 += 1;
        diff += 1;
        while (angle1 >= 360){
            angle1 -= 360;
        }
        infiniteLoopFinder.count();
    }

    return diff;
}

function calculateAngleDiffDEGCCW(angle1, angle2){
    angle1 = Math.floor(angle1);
    angle2 = Math.floor(angle2);
    let diff = 0;
    let infiniteLoopFinder = new InfiniteLoopFinder(500, "calculateAngleDiffDEGCCW");
    while (angle1 != Math.floor(angle2)){
        angle1 -= 1;
        diff += 1;
        while (angle1 < 0){
            angle1 += 360;
        }
        infiniteLoopFinder.count();
    }

    return diff;
}

function rotateCWDEG(angle, amount){
    return fixDegrees(angle + amount);
}

function rotateCCWDEG(angle, amount){
    return fixDegrees(angle - amount);
}

function angleBetweenCWDEG(angle, eAngle1, eAngle2){
    return calculateAngleDiffDEGCW(eAngle1, angle) <= calculateAngleDiffDEGCCW(eAngle1, angle) && calculateAngleDiffDEGCW(angle, eAngle2) <= calculateAngleDiffDEGCCW(angle, eAngle2);
}

function angleBetweenCCWDEG(angle, eAngle1, eAngle2){
    return calculateAngleDiffDEGCCW(eAngle1, angle) <= calculateAngleDiffDEGCW(eAngle1, angle) && calculateAngleDiffDEGCCW(angle, eAngle2) <= calculateAngleDiffDEGCW(angle, eAngle2);
}

function lessThanDir(p1, p2, velocity){
    return (velocity >= 0) ? (p1 < p2) : (p1 > p2);
}

function lessThanEQDir(p1, p2, velocity){
    return (velocity >= 0) ? (p1 <= p2) : (p1 >= p2);
}

function nextIntInDir(floatValue, velocity){
    let newValue = Math.ceil(floatValue);
    if (velocity < 0){
        newValue = Math.floor(floatValue);
    }

    // If floatValue is an int then go by 1 in the next direction
    if (newValue == floatValue){
        newValue += (velocity < 0) ? -1 : 1;
    }

    return newValue;
}

function randomFloatBetween(lowerBound, upperBound){
    return Math.random() * (upperBound - lowerBound) + lowerBound;
}

function countryToAlliance(country){
    return fileData["country_to_alliance"][country];
}

function planeModelToCountry(planeModel){
    return fileData["plane_data"][planeModel]["country"];
}

function planeModelToAlliance(planeModel){
    return countryToAlliance(planeModelToCountry(planeModel));
}