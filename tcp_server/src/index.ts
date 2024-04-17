import * as net from 'net';
import * as wp from 'workerpool';
import * as fs from 'fs';

const PORTS = [3003, 3004, 3005, 3006, 3007]; // Lista portów do nasłuchiwania
const IP = '127.0.0.1';
const BACKLOG = 100;
const workerpool = wp.pool();

const logFilePath = 'log.json'; // Ścieżka do pliku JSON, w którym będziemy zapisywać logi

// Funkcja do kompilowania odpowiedzi HTTP
const compileResponse = (response: any) => {
  const headers = [
    `HTTP/1.1 ${response.statusCode} ${response.status}`,
    'Content-Type: text/html',
    `Content-Length: ${response.body.length}`,
    '',
    response.body
  ].join('\r\n');

  return headers;
};

// Funkcja obsługująca połączenie
const handleConnection = (port: number) => {
  console.log(`Server listening on port ${port}`);
  
  return (socket: net.Socket) => {
    console.log(`New connection on port ${port}`);
    
    socket.write("Welcome to Telnet server!\r\n"); // Wysłanie wiadomości powitalnej
    
    let buffer = ''; // Bufor do przechowywania danych
    
    socket.on('data', data => {
      buffer += data.toString(); // Dodanie otrzymanych danych do bufora
      
      // Jeśli otrzymano znak nowej linii (Enter)
      if (data.includes('\n')) {
        // Przetworzenie danych w buforze
        processData(buffer.trim(), port, socket);
        // Wyczyszczenie bufora
        buffer = '';
      }
    });
  
    socket.on('end', () => {
      if (buffer.length > 0) {
        processData(buffer.trim(), port, socket);
      }
      console.log(`Connection closed on port ${port}`);
    });
  
    socket.on('error', err => {
      console.error(`Error in connection on port ${port}:`, err);
    });
  };
};

// Funkcja do przetwarzania danych
const processData = (data: string, port: number, socket: net.Socket) => {
  console.log(`Data received on port ${port}: ${data}`);
  
  // Zapisz otrzymane dane do pliku logów
  appendToLog({ type: 'received', port: port, data: data });
  
  // Tworzenie odpowiedzi na podstawie otrzymanych danych
  const responseBody = `<html><body><h1>Received: ${data}</h1></body></html>`;
  const response = compileResponse({
    statusCode: 200,
    status: 'OK',
    body: responseBody
  });
  
  // Wysłanie odpowiedzi do klienta Telnet
  socket.write(response);
  console.log(`Response sent on port ${port}: ${response}`);
  
  // Zapisz wysłane dane do pliku logów
  appendToLog({ type: 'sent', port: port, data: response });
};

// Funkcja do zapisywania danych do pliku JSON
const appendToLog = (data: any) => {
  fs.appendFile(logFilePath, JSON.stringify(data) + '\n', (err) => {
    if (err) {
      console.error('Error appending to log file:', err);
    }
  });
};

// Tworzenie serwera na każdym z portów
const servers = PORTS.map(port => {
  const server = net.createServer(handleConnection(port));
  server.listen(port, IP, BACKLOG);
  return server;
});
