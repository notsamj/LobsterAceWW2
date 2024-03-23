if (typeof window === "undefined"){
    SeededRandomizer = require("./seeded_randomizer.js");
}
// TODO: Class needs comments
class SimpleCryptography {
    constructor(secretSeed){
        this.secretSeed = secretSeed;
        this.disabled = false;
    }

    encrypt(data){
        if (this.disabled){
            return data;
        }
        let encryptedData = [];
        let numChars = data.length;
        let randomizer = new SeededRandomizer(this.secretSeed + numChars);
        for (let i = 0; i < numChars; i++){
            let charCode = data.charCodeAt(i);
            let randomOffset = randomizer.getIntInRangeInclusive(-1 * 65535, 65535);
            let encryptedCharCode = charCode + randomOffset;
            // Ensure its in the right range
            if (encryptedCharCode < 0){
                encryptedCharCode += 65535;
            }else if (encryptedCharCode > 65535){
                encryptedCharCode -= 65535;
            }
            encryptedData.push(encryptedCharCode);
        }
        return JSON.stringify(encryptedData);
    }

    decrypt(encryptedData){
        if (this.disabled){
            return encryptedData;
        }
        // Make sure each number is in the proper range
        let dataFormat = /[0-9]+/g;
        let matches = [...encryptedData.matchAll(dataFormat)];
        let numChars = matches.length;
        let randomizer = new SeededRandomizer(this.secretSeed + numChars);
        let decryptedString = [];
        for (let i = 0; i < numChars; i++){
            let charCode = parseInt(matches[i]);
            let randomOffset = randomizer.getIntInRangeInclusive(-1 * 65535, 65535);
            charCode += (-1 * randomOffset); // -1 * because going in the opposite direction of encryption
            // Ensure its in the right range
            // Note: I know I could just not do this in encrypt and decrypt but I prefer to have this simple random
            if (charCode < 0){
                charCode += 65535;
            }else if (charCode > 65535){
                charCode -= 65535;
            }
            decryptedString.push(String.fromCharCode(charCode));
        }
        return decryptedString.join("");
    }

    matchesEncryptedFormat(data){
        if (this.disabled){
            return true;
        }
        let format = /^\[(([0-9]+,)*[0-9]+)?\]$/;
        // If it doesn't match then ignore
        if (data.match(format) == null){ return false; }

        // Make sure each number is in the proper range
        let dataFormat = /[0-9]+/g;
        let matches = data.matchAll(dataFormat);
        for (let i = 1; i < matches.length; i++){
            let charCode = parseInt(matches[i]);
            if (charCode > 65535 || charCode < 0){
                return false;
            }
        }
        return true;
    }
}

// If using Node JS Export the class
if (typeof window === "undefined"){
    module.exports = SimpleCryptography;
}
