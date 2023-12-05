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
    while (angle < 0){
        angle += 360;
    }
    while(angle >= 360){
        angle -= 360;
    }
    return angle;
}

function fixRadians(angle){
    while (angle < 0){
        angle += 2 * Math.PI;
    }
    while (angle >= 2 * Math.PI){
        angle -= Math.PI;
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
    return fileData["plane_data"][class1]["alliance"] == fileData["plane_data"][class2]["alliance"];
}

// Not sure this works xD
function calculateAngleDiffDEG(angle1, angle2){
    if (angle1 > 180){
        angle1 -= 360;
    }
    if (angle2 > 180){
        angle2 -= 360;
    }

    return Math.abs(Math.abs(angle1) - Math.abs(angle2));
}

function calculateAngleDiffDEGCW(angle1, angle2){
    let diff = 0;
    while (angle1 != Math.floor(angle2)){
        angle1 += 1;
        diff += 1;
        while (angle1 >= 360){
            angle1 -= 360;
        }
    }

    return diff;
}

function calculateAngleDiffDEGCCW(angle1, angle2){
    let diff = 0;
    while (angle1 != Math.floor(angle2)){
        angle1 -= 1;
        diff += 1;
        while (angle1 < 0){
            angle1 += 360;
        }
    }

    return diff;
}

function rotateCWDEG(angle, amount){
    return fixDegrees(angle + amount);
}

function rotateCCWDEG(angle, amount){
    return fixDegrees(angle - amount);
}

function angleBetweenDEG(angle, eAngle1, eAngle2){
    return angle >= eAngle1 && angle <= eAngle2; 
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