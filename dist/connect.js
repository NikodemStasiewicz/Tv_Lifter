"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const telnet_stream_1 = require("telnet-stream");
// create a Socket connection
const socket = require("net").createConnection(3000, "localhost:3003");
// decorate the Socket connection as a TelnetSocket
const tSocket = new telnet_stream_1.TelnetSocket(socket);
// if the socket closes, terminate the program
tSocket.on("close", (hadError) => {
    process.exit();
});
// if we get any data, display it to stdout
tSocket.on("data", (data) => {
    if (typeof data === "string") {
        process.stdout.write(data);
    }
    else {
        process.stdout.write(data.toString("utf8"));
    }
});
// if the user types anything, send it to the socket
process.stdin.on("data", (buffer) => {
    tSocket.write(buffer.toString("utf8"));
});
// Explicitly specify event type for stdin
process.stdin.setEncoding("utf8");
