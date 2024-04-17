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
const wp = __importStar(require("workerpool"));
const fs = __importStar(require("fs"));
const PORTS = [3003, 3004, 3005, 3006, 3007]; // Lista portów do nasłuchiwania
const IP = '127.0.0.1';
const BACKLOG = 100;
const workerpool = wp.pool();
const logFilePath = 'log.json'; // Ścieżka do pliku JSON, w którym będziemy zapisywać logi
// Funkcja do kompilowania odpowiedzi HTTP
const compileResponse = (response) => {
    const headers = [
        `HTTP/1.1 ${response.statusCode} ${response.status}`,
        'Content-Type: text/html',
        `Content-Length: ${response.body.length}`,
        '',
        response.body
    ].join('\r\n');
    return headers;
};
// Funkcja do generowania ciągu Fibonacciego
const fibonacci = (n) => (n < 2) ? n : fibonacci(n - 2) + fibonacci(n - 1);
// Funkcja obsługująca połączenie
const handleConnection = (port) => (socket) => {
    console.log(`New connection on port ${port}`);
    socket.on('data', buffer => {
        console.log(`Data received on port ${port}`);
        // Zapisz otrzymane dane do pliku logów
        appendToLog({ type: 'received', port: port, data: buffer.toString("utf8") });
        // Obsługa żądania
        const responseBody = `<html><body><h1>Content ${port}!</h1></body></html>`;
        const response = compileResponse({
            statusCode: 200,
            status: 'OK',
            body: responseBody
        });
        socket.write(response);
        console.log(`Response sent on port ${port}`);
        socket.end();
        console.log(`Connection closed on port ${port}`);
        // Zapisz wysłane dane do pliku logów
        appendToLog({ type: 'sent', port: port, data: response });
    });
};
// Funkcja do zapisywania danych do pliku JSON
const appendToLog = (data) => {
    fs.appendFile(logFilePath, JSON.stringify(data) + '\n', (err) => {
        if (err) {
            console.error('Error appending to log file:', err);
        }
    });
};
// Tworzenie serwera na każdym z portów
const servers = PORTS.map(port => {
    const server = net.createServer();
    server.listen(port, IP, BACKLOG);
    server.on('listening', () => {
        console.log(`Server listening on port ${port}`);
    });
    server.on('connection', handleConnection(port));
    return server;
});
