// If using NodeJS then do required imports
if (typeof window === "undefined"){
    PROGRAM_DATA = require("../../data/data_json.js");
}

/*
    Method Name: getIndexOfElementInList
    Method Parameters:
        list:
            A list of values
        value:
            A value to find in the list
    Method Description: Finds the index of a value in a list
    Method Return: Integer
*/
function getIndexOfElementInList(list, value){
    for (let i = 0; i < list.length; i++){
        if (list[i] == value){ return i; }
    }
    return -1;
}

/*
    Method Name: modifyDataJSONValue
    Method Parameters:
        path:
            A list of strings representing a path through the PROGRAM_DATA JSON Object
        newValue:
            new value to place in the JSON OBject
    Method Description: Finds a JSON object with a given path
    Method Return: JSON Object
*/
function modifyDataJSONValue(path, newValue){
    path = copyArray(path);
    let finalKey = path[path.length-1];
    getDataJSONObjAtPath(path)[finalKey] = newValue;
}

/*
    Method Name: getDataJSONObjAtPath
    Method Parameters:
        path:
            A list of strings representing a path through the PROGRAM_DATA JSON Object
    Method Description: Finds a value at a given path through the PROGRAM_DATA JSON Object
    Method Return: Unknown
*/
function accessDataJSONValue(path){
    path = copyArray(path);
    let finalKey = path[path.length-1];
    return getDataJSONObjAtPath(path)[finalKey];
}

/*
    Method Name: getDataJSONObjAtPath
    Method Parameters:
        path:
            A list of strings representing a path through the PROGRAM_DATA JSON Object
    Method Description: Finds a JSON object with a given path
    Method Return: JSON Object
*/
function getDataJSONObjAtPath(path){
    let obj = PROGRAM_DATA;
    while (path.length > 1){
        obj = obj[path.shift()];
    }
    return obj;
}

/*
    Method Name: getImage
    Method Parameters:
        imageName:
            Name of the image to retrive from the global images variable
    Method Description: Attempts to retrive an image from storage. *Does not work with nodeJS, returns null
    Method Return: Image
*/
function getImage(imageName){
    // If using Node JS return null
    if (typeof window === "undefined"){
        return null;
    }
    return IMAGES[imageName];
}

/*
    Method Name: getTickMultiplier
    Method Parameters: None
    Method Description: Returns how many times slower the tick rate is than a tickrate of 100 (previously the standard tickrate)
    Method Return: Number
*/
function getTickMultiplier(){
    return 100 / PROGRAM_DATA["settings"]["tick_rate"];
}

/*
    Method Name: objectHasKey
    Method Parameters:
        obj:
            A json object
        key:
            A key
    Method Description: Determines if a JSON object has a given key
    Method Return: Boolean
*/
function objectHasKey(obj, key){
    for (let foundKey of Object.keys(obj)){
        if (foundKey == key){ return true; }
    }
    return false;
}

/*
    Method Name: mergeCopyObjects
    Method Parameters:
        obj1:
            Object 1
        obj2:
            Object 2
    Method Description: Creates a JSON object with the contents of two JSON objects. Copying rather than referencing (with limitations)
    Method Return: JSON Object
*/
function mergeCopyObjects(obj1, obj2){
    let newObject = {};
    // Merge in object 1
    for (let key of Object.keys(obj1)){
        if (typeof obj1[key] === "object"){
            newObject[key] = copyObject(obj1[key]);
        }else{
            newObject[key] = obj1[key];
        }
    }
    // Merge in object 2
    for (let key of Object.keys(obj2)){
        if (typeof obj2[key] === "object"){
            newObject[key] = copyObject(obj2[key]);
        }else{
            newObject[key] = obj2[key];
        }
    }
    return newObject;
}

/*
    Method Name: copyObject
    Method Parameters:
        obj:
            Object to copy
    Method Description: Creates a copy of an object (to some extent)
    Method Return: JSON Object
    Note: If you give it and instance of a class it will produce a reference not a copy
*/
function copyObject(obj){
    // Deep copy, copy inner objects aswell
    let newObject = {};
    for (let key of Object.keys(obj)){
        if (typeof obj[key] === "object"){
            newObject[key] = copyObject(obj[key]);
        }else{
            newObject[key] = obj[key];
        }
    }
    return newObject;
}

/*
    Method Name: appendLists
    Method Parameters:
        list1:
            A list
        list2:
            Another list
    Method Description: Attaches two lists, list1=[l1i0, l1i1, ...], list2=[l2i0, l2i1, ...] result: [l1i0, l1i1, ..., l2i0, l2i1, ...]
    Method Return: list
*/
function appendLists(list1, list2){
    let appendedList = [];
    for (let item of list1){
        appendedList.push(item);
    }
    for (let item of list2){
        appendedList.push(item);
    }
    return appendedList;
}

/*
    Method Name: safeDivide
    Method Parameters:
        numerator:
            The numerator of a division
        denominator:
            The denominator of a division 
        closeToZeroAmount:
            Amount between [0,INF], if denominator < closeToZeroAmount then return valueIfCloseToZero
        valueIfCloseToZero:
            Value to return if the denominator is close to zero
    Method Description: Divides two numbers, returning a special result if the denominator is close to zero
    Method Return: float (or special value)
*/
function safeDivide(numerator, denominator, closeToZeroAmount, valueIfCloseToZero){
    if (Math.abs(denominator) < closeToZeroAmount){ return valueIfCloseToZero; }
    return numerator / denominator;
}

/*
    Method Name: getLocalStorage
    Method Parameters:
        key:
            Key of the item in local storage
        valueIfNotFound:
            Value to return if the item cannot be found
    Method Description: Finds a value from storage, returns valueIfNotFound if not found.
    Method Return: void
*/
function getLocalStorage(key, valueIfNotFound=null){
    // In node js, you can't access this storage
    if (typeof window === "undefined"){ return valueIfNotFound; }
    let value = localStorage.getItem(key);
    if (value == null){
        return valueIfNotFound;
    }
    return value;
}

/*
    Method Name: setLocalStorage
    Method Parameters:
        key:
            Key of the item in local storage
        value:
            Value to put in local storage
    Method Description: Assignes a key to a value in local storage. Errors are not *really* handled.
    Method Return: void
*/
function setLocalStorage(key, value){
    // In node js, you can't access this storage
    if (typeof window === "undefined"){ return; }
    try {
        localStorage.setItem(key, value);
    }catch(e){}
}

/*
    Method Name: getScreenWidth
    Method Parameters: None
    Method Description: Determines the screen width in real pixels
    Method Return: void
*/
function getScreenWidth(){
    return window.innerWidth; // * pixelSomething density in the future?
}
/*
    Method Name: getScreenHeight
    Method Parameters: None
    Method Description: Determines the screen height in real pixels
    Method Return: void
*/
function getScreenHeight(){
    return window.innerHeight;
}

/*
    Method Name: getDegreesFromDisplacement
    Method Parameters:
        dX:
            Displacement in x
        dY:
            Displacement in y
    Method Description: Determines the angle [0,359] from a x and y displacement
    Method Return: int
*/
function getDegreesFromDisplacement(dX, dY){
    let dXAbs = Math.abs(dX);
    let dYAbs = Math.abs(dY);
    if (dXAbs < 1){
        return dY > 0 ? 90 : 270;
    }else if (dYAbs < 1){
        return dX > 0 ? 0 : 180;
    }
    let angle = Math.atan(dYAbs / dXAbs);
    let angleDEG = toDegrees(angle);
    if (dX < 0 && dY > 0){ // Quadrant 2
        return fixDegrees(180 - angleDEG);
    }else if (dX < 0 && dY < 0){ // Quadrant 3
        return fixDegrees(180 + angleDEG);
    }else if (dX > 0 && dY < 0){ // Quadrant 4
        return fixDegrees(360 - angleDEG);
    }else{ // Quadrant 1
        return fixDegrees(angleDEG);
    }
}

/*
    Method Name: planeModelToType
    Method Parameters:
        model:
            The model of a plane
    Method Description: Determines the type of plane, given a model
    Method Return: String
*/
function planeModelToType(model){
    return PROGRAM_DATA["plane_data"][model]["type"];
}

/*
    Method Name: copyArray
    Method Parameters:
        array:
            An array to copy
    Method Description: Creates a copy of an array
    Method Return: void
*/
function copyArray(array){
    let newArray = [];
    for (let i = 0; i < array.length; i++){
        newArray.push(array[i]);
    }
    return newArray;
}

/*
    Method Name: listMean
    Method Parameters:
        list:
            An list to to find the mean of
    Method Description: Finds the mean value of a list of numbers
    Method Return: Number
*/
function listMean(list){
    if (list.length == 0){ return -1; }
    let total = 0;
    for (let i = 0; i < list.length; i++){
        total += list[i];
    }
    return total / list.length;
}

/*
    Method Name: listMin
    Method Parameters:
        list:
            An list to find the minimum number in
    Method Description: Finds the min value of a list of numbers
    Method Return: Number
*/
function listMin(list){
    let min = Number.MAX_SAFE_INTEGER;
    for (let i = 0; i < list.length; i++){
        if (list[i] < min){
            min = list[i];
        }
    }
    return min;
}

/*
    Method Name: listMax
    Method Parameters:
        list:
            An list to find the max of
    Method Description: Finds the max value of a list of numbers
    Method Return: Number
*/
function listMax(list){
    let max = Number.MIN_SAFE_INTEGER;
    for (let i = 0; i < list.length; i++){
        if (list[i] > max){
            max = list[i];
        }
    }
    return max;
}

/*
    Method Name: listMedian
    Method Parameters:
        list:
            An list to find the median of
    Method Description: Finds the median number in a list
    Method Return: Number
*/
function listMedian(list){
    if (list.length == 0){ return -1; }
    let newList = copyArray(list);
    newList.sort();
    return newList[Math.floor(newList.length/2)];
}

/*
    Method Name: isClose
    Method Parameters:
        num1:
            A number
        num2:
            A number
        closeNumber:
            A small number
    Method Description: Converts degrees to radians
    Method Return: float
*/
function isClose(num1, num2, closeNumber){
    return Math.abs(num1 - num2) < closeNumber;
}

/*
    Method Name: toRadians
    Method Parameters:
        degrees:
            The number of degrees to convert to radians
    Method Description: Converts degrees to radians
    Method Return: float
*/
function toRadians(degrees){
    return degrees * Math.PI / 180;
}


/*
    Method Name: toDegrees
    Method Parameters:
        radians:
            An amount of radians to convert to degrees
    Method Description: Converts an amount of radians to degrees
    Method Return: int
*/
function toDegrees(radians){
    return radians / (2 * Math.PI) * 360;
}

/*
    Method Name: fixDegrees
    Method Parameters:
        angle:
            An angle to "fix"
    Method Description: Fixes an angle to the range [0,359]
    Method Return: int
*/
function fixDegrees(angle){
    while (angle < 0){
        angle += 360;
    }
    while(angle >= 360){
        angle -= 360;
    }
    return angle;
}

/*
    Method Name: fixRadians
    Method Parameters:
        angle:
            An angle to "fix"
    Method Description: Fixes an angle to the range [0,2*PI)
    Method Return: float
*/
function fixRadians(angle){
    while (angle < 0){
        angle += 2 * Math.PI;
    }
    while (angle >= 2 * Math.PI){
        angle -= 2 * Math.PI;
    }
    return angle;
}

/*
    Method Name: toFixedRadians
    Method Parameters:
        angle:
            An angle to "fix"
    Method Description: Converts to degrees and fixes an angle to the range [0,2*PI)
    Method Return: float
*/
function toFixedRadians(angleDEG){
    return fixRadians(toRadians(angleDEG));
}

/*
    Method Name: displacementToDegrees
    Method Parameters:
        dX:
            The displacement in x
        dY:
            The displacement in y
    Method Description: Creates a copy of an array
    Method Return: int
*/
function displacementToDegrees(dX, dY){
    return fixDegrees(toDegrees(displacementToRadians(dX, dY)));
}

/*
    Method Name: displacementToRadians
    Method Parameters:
        dX:
            The displacement in x
        dY:
            The displacement in y
    Method Description: Converts displacement in x, y to an angle in radians
    Method Return: float
*/       
function displacementToRadians(dX, dY){
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

/*
    Method Name: randomNumberInclusive
    Method Parameters:
        min:
            Minimum value (inclusive)
        maxInclusive:
            Maximum value (inclusive)
    Method Description: Come up with a number in a given range [min, maxInclusive]
    Method Return: int
*/
function randomNumberInclusive(min, maxInclusive){
    return Math.floor(Math.random() * (maxInclusive - min + 1)) + min;
}

/*
    Method Name: randomNumberInclusive
    Method Parameters:
        maxExclusive:
            Minimum value (exclusive)
    Method Return: int
*/
function randomNumber(maxExclusive){
    return randomNumberInclusive(0, maxExclusive-1);
}

/*
    Method Name: onSameTeam
    Method Parameters:
        class1:
            Plane type of the first plane
        class2:
            Plane type of the second plane
    Method Description: Determines if two planes are on the same team
    Method Return: boolean, True -> On same team, False -> Not on the same team
*/
function onSameTeam(class1, class2){
    return countryToAlliance(PROGRAM_DATA["plane_data"][class1]["country"]) == countryToAlliance(PROGRAM_DATA["plane_data"][class2]["country"]);
}

/*
    Method Name: calculateAngleDiffDEG
    Method Parameters:
        angle1:
            An angle in degrees
        angle2:
            An angle in degrees
    Method Description: Calculates the difference between two angles in degrees
    Method Return: int
*/
function calculateAngleDiffDEG(angle1, angle2){
    let diff = Math.max(angle1, angle2) - Math.min(angle1, angle2);
    if (diff > 180){
        diff = 360 - diff;
    }
    return diff;
}

/*
    Method Name: calculateAngleDiffRAD
    Method Parameters:
        angle1:
            An angle in degrees
        angle2:
            An angle in degrees
    Method Description: Calculates the difference between two angles in radians
    Method Return: int
*/
function calculateAngleDiffRAD(angle1, angle2){
    let diff = Math.max(angle1, angle2) - Math.min(angle1, angle2);
    if (diff > Math.PI){
        diff = 2*Math.PI - diff;
    }
    return diff;
}

/*
    Method Name: calculateAngleDiffCCWDEG
    Method Parameters:
        angle1:
            An angle in degrees
        angle2:
            An angle in degrees
    Method Description: Calculates the difference between two angles in degrees (in the counter clockwise direction)
    Method Return: int
*/
function calculateAngleDiffCCWDEG(angle1, angle2){
    angle1 = Math.floor(angle1);
    angle2 = Math.floor(angle2);
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

/*
    Method Name: calculateAngleDiffCWDEG
    Method Parameters:
        angle1:
            An angle in degrees
        angle2:
            An angle in degrees
    Method Description: Calculates the difference between two angles in degrees (in the clockwise direction)
    Method Return: int
*/
function calculateAngleDiffCWDEG(angle1, angle2){
    angle1 = Math.floor(angle1);
    angle2 = Math.floor(angle2);
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

/*
    Method Name: rotateCWDEG
    Method Parameters:
        angle:
            Angle to rotate
        amount:
            Amount to rotate by
    Method Description: Rotates an angle clockwise by an amount
    Method Return: int
*/
function rotateCWDEG(angle, amount){
    return fixDegrees(angle - amount);
}

/*
    Method Name: rotateCWRAD
    Method Parameters:
        angle:
            Angle to rotate
        amount:
            Amount to rotate by
    Method Description: Rotates an angle clockwise by an amount
    Method Return: float
*/
function rotateCWRAD(angle, amount){
    return fixRadians(angle - amount);
}

/*
    Method Name: rotateCCWDEG
    Method Parameters:
        angle:
            Angle to rotate
        amount:
            Amount to rotate by
    Method Description: Rotates an angle counter clockwise by an amount
    Method Return: int
*/
function rotateCCWDEG(angle, amount){
    return fixDegrees(angle + amount);
}

/*
    Method Name: rotateCCWRAD
    Method Parameters:
        angle:
            Angle to rotate
        amount:
            Amount to rotate by
    Method Description: Rotates an angle counter clockwise by an amount
    Method Return: float
*/
function rotateCCWRAD(angle, amount){
    return fixRadians(angle + amount);
}

/*
    Method Name: angleBetweenCCWDEG
    Method Parameters:
        angle:
            An angle in degrees
        eAngle1:
            An angle on one edge of a range
        eAngle2:
            An angle on the other edge of a range
    Method Description: Determines if angle is between eAngle1 and eAngle2 in the counter clockwise direction (inclusive)
    Method Return: boolean, true -> angle is between, false -> angle is not between
*/
function angleBetweenCCWDEG(angle, eAngle1, eAngle2){
    angle = fixDegrees(Math.floor(angle));
    eAngle1 = fixDegrees(Math.floor(eAngle1));
    eAngle2 = fixDegrees(Math.floor(eAngle2));
    let tAngle = eAngle1;
    if (tAngle == eAngle2){
        return true;
    }
    while (tAngle != eAngle2){
        if (tAngle == angle){
            return true;
        }
        tAngle += 1;
        if (tAngle == 360){
            tAngle = 0;
        }
    }
    return false;
}

/*
    Method Name: angleBetweenCWRAD
    Method Parameters:
        angle:
            An angle in radians
        eAngle1:
            An angle on one edge of a range (radians)
        eAngle2:
            An angle on the other edge of a range (radians)
    Method Description: Determines if angle is between eAngle1 and eAngle2 in the clockwise direction
    Method Return: boolean, true -> angle is between, false -> angle is not between
*/
function angleBetweenCWRAD(angle, eAngle1, eAngle2){
    if (angle > eAngle1){
        angle -= 2 * Math.PI;
    }
    if (eAngle2 > eAngle1){
        eAngle2 -= 2 * Math.PI;
    }
    let distanceFromEAngle1ToAngleCW = (angle - eAngle1) / -1;
    let distanceFromEAngle1ToEAngle2CW = (eAngle2 - eAngle1) / -1;
    return distanceFromEAngle1ToAngleCW <= distanceFromEAngle1ToEAngle2CW;
}

/*
    Method Name: angleBetweenCCWRAD
    Method Parameters:
        angle:
            An angle in radians
        eAngle1:
            An angle on one edge of a range (radians)
        eAngle2:
            An angle on the other edge of a range (radians)
    Method Description: Determines if angle is between eAngle1 and eAngle2 in the counter clockwise direction
    Method Return: boolean, true -> angle is between, false -> angle is not between
*/
function angleBetweenCCWRAD(angle, eAngle1, eAngle2){
    if (angle < eAngle1){
        angle += 2 * Math.PI;
    }
    if (eAngle2 < eAngle1){
        eAngle2 += 2 * Math.PI;
    }
    let distanceFromEAngle1ToAngleCCW = angle - eAngle1;
    let distanceFromEAngle1ToEAngle2CCW = eAngle2 - eAngle1;
    return distanceFromEAngle1ToAngleCCW <= distanceFromEAngle1ToEAngle2CCW;
}

/*
    Method Name: calculateAngleDiffCWRAD
    Method Parameters:
        angle1:
            An angle in radians
        angle2:
            An angle in radians
    Method Description: Calculate the distance in radians from angle1 to angle2
    Method Return: Float
*/
function calculateAngleDiffCWRAD(angle1, angle2){
    if (angle2 > angle1){
        angle2 -= 2 * Math.PI;
    }
    let difference = (angle2 - angle1) / -1;
    return difference;
}

/*
    Method Name: calculateAngleDiffCCWRAD
    Method Parameters:
        angle1:
            An angle in radians
        angle2:
            An angle in radians
    Method Description: Calculate the distance in radians from angle1 to angle2
    Method Return: Float
*/
function calculateAngleDiffCCWRAD(angle1, angle2){
    if (angle2 < angle1){
        angle2 += 2 * Math.PI;
    }
    let difference = angle2 - angle1;
    return difference;
}

/*
    Method Name: angleBetweenCWDEG
    Method Parameters:
        angle:
            An angle in degrees
        eAngle1:
            An angle on one edge of a range
        eAngle2:
            An angle on the other edge of a range
    Method Description: Determines if angle is between eAngle1 and eAngle2 in the clockwise direction (inclusive)
    Method Return: boolean, true -> angle is between, false -> angle is not between
*/
function angleBetweenCWDEG(angle, eAngle1, eAngle2){
    angle = fixDegrees(Math.floor(angle));
    eAngle1 = fixDegrees(Math.floor(eAngle1));
    eAngle2 = fixDegrees(Math.floor(eAngle2));
    let tAngle = eAngle1
    if (tAngle == eAngle2){
        return true;
    }
    while (tAngle != eAngle2){
        if (tAngle == angle){
            return true;
        }
        tAngle -= 1;
        if (tAngle == -1){
            tAngle = 359;
        }
    }
    return false;
}

/*
    Method Name: lessThanDir
    Method Parameters:
        p1:
            A point in a 1d space
        p2:
            Another point in a 1d space
        velocity:
            Velocity of an object
    Method Description: Whether p1 is less than p2 while travelling in a direction
    Method Return: Boolean, true -> p1 < p2 in the direction of velocity, false -> otherwise
*/
function lessThanDir(p1, p2, velocity){
    return (velocity >= 0) ? (p1 < p2) : (p1 > p2);
}

/*
    Method Name: lessThanEQDir
    Method Parameters:
        p1:
            A point in a 1d space
        p2:
            Another point in a 1d space
        velocity:
            Velocity of an object
    Method Description: Whether p1 is less than p2 while travelling in a direction
    Method Return: Boolean, true -> p1 <= p2 in the direction of velocity, false -> otherwise
*/
function lessThanEQDir(p1, p2, velocity){
    return (velocity >= 0) ? (p1 <= p2) : (p1 >= p2);
}

/*
    Method Name: nextIntInDir
    Method Parameters:
        floatValue:
            A float value
        velocity:
            Direction in which an object is moving
    Method Description: Finds the ceiling or floor of a float depending on the direction it is moving
    Method Return: int
*/
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

/*
    Method Name: randomFloatBetween
    Method Parameters:
        lowerBound:
            Lower bound float value
        upperBound:
            Upper bound float value
    Method Description: Finds a random float between two ends
    Method Return: float
*/
function randomFloatBetween(lowerBound, upperBound){
    return Math.random() * (upperBound - lowerBound) + lowerBound;
}

/*
    Method Name: countryToAlliance
    Method Parameters:
        country:
            A string representing a country name
    Method Description: Find the alliance for a given country
    Method Return: String
*/
function countryToAlliance(country){
    return PROGRAM_DATA["country_to_alliance"][country];
}

/*
    Method Name: planeModelToCountry
    Method Parameters:
        planeModel:
            A string representing a plane type
    Method Description: Find the country for a given plane model
    Method Return: String
*/
function planeModelToCountry(planeModel){
    return PROGRAM_DATA["plane_data"][planeModel]["country"];
}

/*
    Method Name: planeModelToAlliance
    Method Parameters:
        planeModel:
            A string representing a plane type
    Method Description: Find the alliance for a given plane model
    Method Return: String
*/
function planeModelToAlliance(planeModel){
    return countryToAlliance(planeModelToCountry(planeModel));
}

/*
    Method Name: sleep
    Method Parameters:
        ms:
            A number of ms to sleep for
    Method Description: Sleeps for a given amount of time
    Method Return: Promise
*/
async function sleep(ms){
    return new Promise((resolve, reject) => { setTimeout(resolve, ms); })
}

// If using NodeJS then export all the functions
if (typeof window === "undefined"){
    module.exports = {
        copyArray,
        toRadians,
        toDegrees,
        fixDegrees,
        fixRadians,
        displacementToDegrees,
        displacementToRadians,
        randomNumberInclusive,
        randomNumber,
        onSameTeam,
        calculateAngleDiffDEG,
        calculateAngleDiffCWDEG,
        calculateAngleDiffCCWDEG,
        rotateCWDEG,
        rotateCCWDEG,
        angleBetweenCWDEG,
        angleBetweenCCWDEG,
        lessThanDir,
        lessThanEQDir,
        nextIntInDir,
        randomFloatBetween,
        countryToAlliance,
        planeModelToCountry,
        planeModelToAlliance,
        sleep,
        listMean,
        listMedian,
        listMin,
        listMax,
        getTickMultiplier,
        objectHasKey,
        mergeCopyObjects,
        copyObject,
        appendLists,
        safeDivide,
        getLocalStorage,
        setLocalStorage,
        getScreenWidth,
        getScreenHeight,
        getDegreesFromDisplacement,
        planeModelToType,
        copyArray,
        getImage,
        toFixedRadians,
        calculateAngleDiffRAD,
        rotateCWRAD,
        rotateCCWRAD,
        angleBetweenCWRAD,
        angleBetweenCCWRAD,
        calculateAngleDiffCCWRAD,
        calculateAngleDiffCWRAD,
        isClose
    }
}
