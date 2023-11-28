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