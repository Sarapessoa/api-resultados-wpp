const WebSocket = require('ws');
const http = require('http');

// Crie um servidor HTTP
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Servidor WebSocket em execução');
});

// Crie um servidor WebSocket associado ao servidor HTTP
const wss = new WebSocket.Server({ server });

// Configure um evento para quando uma conexão WebSocket for estabelecida
wss.on('connection', (ws) => {
  console.log('Conexão WebSocket estabelecida');

  // Configure um evento para receber mensagens do cliente
  ws.on('message', (message) => {
    console.log(`Mensagem recebida: ${message}`);
    
    // Envie uma resposta de volta para o cliente
    ws.send(`Você enviou: ${message}`);
  });
});

const port = 3000

// Inicie o servidor HTTP
server.listen(port, () => {
  console.log('Servidor HTTP em execução na porta 3000');
});
