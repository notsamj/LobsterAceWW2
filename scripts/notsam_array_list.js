class NotSamArrayList {
    constructor(array=null, size=1, size_inc=(size) => size * 2){
        this.size_inc = size_inc;
        if (array == null){
            this.size = size;
            this.array = new Array(this.size);
            this.length = 0;
        }else{
            this.size = array.length;
            this.length = array.length;
            this.array = new Array(this.size);
            this.convert_from_array(array);
        }
    }
    convert_from_array(array){
        for (var i = 0; i < array.length; i++){
            this.add(array[i]);
        }
    }
    resize(){
        this.size = this.size_inc(this.size);
        var newArray = new Array(this.size);
        for (var i = 0; i < this.length; i++){
            newArray[i] = this.array[i];
        }
        this.array = newArray;
    }

    getLength(){
        return this.length;
    }
    add(value){
        if (this.getLength() == this.getSize()){
            this.resize();
        }

        this.array[this.getLength()] = value;
        this.length++;
    }

    append(value){
        this.add(value);
    }

    has(value){
        var index = this.search(value);
        return !(index == -1);
    }

    search(value){
        for (var i = 0; i < this.getLength(); i++){
            if (this.array[i] === value){
                return i;
            }  
        }

        return -1;
    }

    getSize(){
        return this.size;
    }


    getElement(e){
        var index = this.search(e);
        return get(index)
    }

    get(index){
        if (!((index >= 0 && index < this.getLength()))){
            return null;
        }
        return this.array[index];
    }

    remove(index){
        if (!((index >= 0 && index < this.getLength()))){
            return;
        }
        this.array[index] = null;
        for (var i = index; i < this.getLength(); i++){
            this.array[i] = this.array[i+1];
        }
        this.length -= 1;
    }

    copy(){
        var newArr = new NotSamArrayList();
        for (var i = 0; i < this.getLength(); i++){
            newArr.add(this.array[i]);
        }
        return newArr;
    }

    print(){
        console.log("s")
        for (var i = 0; i < this.getLength(); i++){
            console.log(i, this.get(i));
        }
        console.log("f")
    }

    isEmpty(){ return this.getSize() == 0; }

    set(index, value){
        this.array[index] = value;
    }

    put(index, value){
        this.set(index, value);
    }

    fullWithPlaceholder(value){
        while (this.getLength() < this.getSize()){
            this.add(value);
        }
    }

    *[Symbol.iterator](){
        for (let i = 0; i < this.getLength(); i++){
            yield [this.array[i], i];
        }
    }
}
if (typeof window === "undefined"){
    module.exports = NotSamArrayList;
}