import { TelnetSocket } from "telnet-stream";
import { SocketConnectOpts, AddressInfo } from "net";

// create a Socket connection
const socket = require("net").createConnection(3000, "godwars2.org");

// decorate the Socket connection as a TelnetSocket
const tSocket: TelnetSocket = new TelnetSocket(socket);

// if the socket closes, terminate the program
tSocket.on("close", (hadError: boolean) => {
  process.exit();
});

// if we get any data, display it to stdout
tSocket.on("data", (data: Buffer | string) => {
  if (typeof data === "string") {
    process.stdout.write(data);
  } else {
    process.stdout.write(data.toString("utf8"));
  }
});

// if the user types anything, send it to the socket
process.stdin.on("data", (buffer: Buffer) => {
  tSocket.write(buffer.toString("utf8"));
});

// Explicitly specify event type for stdin
process.stdin.setEncoding("utf8");
