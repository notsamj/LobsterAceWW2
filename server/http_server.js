const express = require("express");
const path = require("path");
const cors = require("cors");
// Global Constants
class HTTPServer {
    constructor(port){
        this.app = express();
        this.app.use(express.static("public")); // Provide access to public files
        this.app.use(express.json());
        this.port = port;
        this.app.listen(port, () => {
            console.log(`Game Server Running on Port: ${port}`)
        });
    }

    registerGet(entryPoint, func){
        this.app.get("/" + entryPoint, cors(), func);
    }

    registerPut(entryPoint, func){
        this.app.put("/" + entryPoint, cors(), func);
    }
}
module.exports = HTTPServer;