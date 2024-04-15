"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const net = __importStar(require("net"));
const PORT = 3003;
const IP = '127.0.0.1';
const BACKLOG = 100;
net.createServer()
    .listen(PORT, IP, BACKLOG)
    .on('connection', socket => socket
    .on('data', buffer => {
    const request = buffer.toString();
    socket.write('hello world');
    socket.end();
}));
const parseRequest = (s) => {
    const [firstLine, rest] = divideStringOn(s, '\r\n');
    const [method, url, protocol] = firstLine.split(' ', 3);
    const [headers, body] = divideStringOn(rest, '\r\n\r\n');
    const parsedHeaders = headers.split('\r\n').reduce((map, header) => {
        const [key, value] = divideStringOn(header, ': ');
        return map.set(key, value);
    }, new Map());
    return { protocol, method, url, headers: parsedHeaders, body };
};
const divideStringOn = (s, search) => {
    const index = s.indexOf(search);
    const first = s.slice(0, index);
    const rest = s.slice(index + search.length);
    return [first, rest];
};
