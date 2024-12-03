const { app, BrowserWindow } = require('electron');
const express = require('express');
const http = require('http');
const path = require('path');
const { initSocket } = require('./socket.cjs'); // Importe o código de socket.js

const isDev = process.env.NODE_ENV !== 'production';

// Cria o servidor Express
const server = express();
const httpServer = http.createServer(server);

// Inicializa o Socket.IO
initSocket(httpServer);

// Inicie o servidor Next.js
if (isDev) {
  // No modo de desenvolvimento, o Next.js já estará rodando no localhost:3000
  console.log('Iniciando em modo desenvolvimento...');
} else {
  // Em produção, sirva o conteúdo do build do Next.js
  const next = require('next');
  const nextApp = next({ dev: false });
  const handle = nextApp.getRequestHandler();

  nextApp.prepare().then(() => {
    // Roteia todas as requisições para o Next.js
    server.all('*', (req, res) => {
      return handle(req, res);
    });

    // Inicia o servidor HTTP
    httpServer.listen(3000, () => {
      console.log('Servidor rodando em http://localhost:3000');
    });
  });
}

// Função para criar a janela principal do Electron
function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  // Carrega o conteúdo do servidor Next.js
  win.loadURL('http://localhost:3000');
  win.maximize();
}

// Quando o Electron estiver pronto, cria a janela
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Fecha a aplicação quando todas as janelas são fechadas
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
