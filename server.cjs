const express = require('express');
const next = require('next');
const http = require('http');
const { initSocket } = require('./socket.cjs');  // Importando o arquivo socket.js

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = express();
  const httpServer = http.createServer(server);

  // Inicializa o Socket.IO passando o servidor HTTP
  initSocket(httpServer);

  // Roteamento para o Next.js
  server.all('*', (req, res) => {
    return handle(req, res);
  });

  // Inicia o servidor HTTP e o Socket.IO
  httpServer.listen(3000, (err) => {
    if (err) throw err;
    console.log('Servidor rodando em http://localhost:3000');
  });
});
