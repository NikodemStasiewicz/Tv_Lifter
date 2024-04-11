// get references to the required stuff
var TelnetSocket, net, socket, tSocket;

net = require("net");

({TelnetSocket} = require("telnet-stream"));

// create a Socket connection
socket = net.createConnection(3000, "godwars2.org");

// decorate the Socket connection as a TelnetSocket
tSocket = new TelnetSocket(socket);

// if the socket closes, terminate the program
tSocket.on("close", function() {
  return process.exit();
});

// if we get any data, display it to stdout
tSocket.on("data", function(buffer) {
  return process.stdout.write(buffer.toString("utf8"));
});

// if the user types anything, send it to the socket
process.stdin.on("data", function(buffer) {
  return tSocket.write(buffer.toString("utf8"));
});