const USER_DATA = {
    "name": "Samuel",
    "server_data": {
        "password": "myPassword",
        "server_ip": "localhost",
        "server_port": "8080",
    }
}
if (typeof window === "undefined"){
    module.exports = USER_DATA;
}