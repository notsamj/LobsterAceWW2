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

function randomNumberInclusive(min, maxInclusive){
    return Math.floor(Math.random() * (maxInclusive - min + 1)) + min; 
}

function randomNumber(maxExclusive){
    return randomNumberInclusive(0, maxExclusive-1);
}

function onSameTeam(class1, class2){
    return fileData["plane_data"][class1]["alliance"] == fileData["plane_data"][class2]["alliance"];
}