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

function randomNumberInclusive(min, maxInclusive){
    return Math.floor(Math.random() * (maxInclusive - min + 1)) + min; 
}

function randomNumber(maxExclusive){
    return randomNumberInclusive(0, maxExclusive-1);
}