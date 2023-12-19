const WebSocketServer = require("ws").WebSocketServer;
const server = new WebSocketServer({ port: 8080 })
server.on("connection", (ws) => {
    ws.on("message", (data) => {
        console.log("Data received: %s", data);
    });
    ws.send("Response");
});