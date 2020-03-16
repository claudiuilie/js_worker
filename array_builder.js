class ArrayBuilder {
    id;
    data;
    magnet;
    buff;

    constructor(id, magnet)

    {
        this.id = id;
        this.magnet = magnet;
        this.buff = new SharedArrayBuffer(9);
        this.data = new Int8Array(this.buff);

    }
    
}

module.exports = ArrayBuilder;